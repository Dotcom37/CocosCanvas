import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import pool from "../lib/db.js";

// --------------------------------------------------
// Helper: Generate 6 digit OTP
// --------------------------------------------------

const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

// --------------------------------------------------
// Helper: Send email using Brevo
// --------------------------------------------------

const sendEmail = async (to, subject, htmlContent) => {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },

    body: JSON.stringify({
      sender: {
        name: "CocosCanvas",
        email: process.env.BREVO_SENDER_EMAIL,
      },

      to: [
        {
          email: to,
        },
      ],

      subject,
      htmlContent,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Brevo error:", error);
    throw new Error("Failed to send email");
  }
};

// ==================================================
// SIGNUP
// ==================================================

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      `INSERT INTO users
       (name, email, password, is_verified)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [name, email, hashedPassword, false]
    );
    const userId = result.rows[0].id
    // Generate OTP
    const otp = generateOTP();

    // Delete previous signup OTP
    await pool.query(
      `DELETE FROM otp
       WHERE email = $1 AND type = 'signup'`,
      [email]
    );

    // Store OTP
    await pool.query(
      `INSERT INTO otp
       (user_id,email, otp, type, attempts, expires_at)
       VALUES ($1, $2, $3, $4,$5, NOW() + INTERVAL '10 minutes')`,
      [userId, email, otp, "signup", 0]
    );

    // Send OTP
    await sendEmail(
      email,
      "CocosCanvas - Verify your account",
      `
        <h2>Welcome to CocosCanvas!</h2>

        <p>Your verification OTP is:</p>

        <h1>${otp}</h1>

        <p>This OTP will expire in 10 minutes.</p>
      `
    );

    res.status(201).json({
      message: "Signup successful. OTP sent to your email.",
    });

  } catch (error) {
    console.error("Signup error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ==================================================
// VERIFY SIGNUP OTP
// ==================================================

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const result = await pool.query(
      `SELECT *
       FROM otp
       WHERE email = $1
       AND type = 'signup'
       ORDER BY id DESC
       LIMIT 1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        message: "OTP not found",
      });
    }

    const otpRecord = result.rows[0];

    // Check expiry
    if (new Date(otpRecord.expires_at) < new Date()) {
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    // Check attempts
    if (otpRecord.attempts >= 5) {
      return res.status(429).json({
        message: "Too many attempts",
      });
    }

    // Wrong OTP
    if (otpRecord.otp !== otp) {
      await pool.query(
        `UPDATE otp
         SET attempts = attempts + 1
         WHERE id = $1`,
        [otpRecord.id]
      );

      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    // Verify user
    await pool.query(
      `UPDATE users
       SET is_verified = true
       WHERE email = $1`,
      [email]
    );

    // Delete used OTP
    await pool.query(
      `DELETE FROM otp
       WHERE id = $1`,
      [otpRecord.id]
    );

    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    )
    
    if (userResult.rows.length == 0){
      return res.json({
        message:"invalid password or email"
      })
    }
    const user = userResult.rows[0]
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );
    res.json({
      message: "Email verified successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("Verify OTP error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ==================================================
// LOGIN
// ==================================================

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }
  
    const user = result.rows[0];

    // Check password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Check email verification
    if (!user.is_verified) {
      return res.status(403).json({
        message: "Please verify your email first",
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ==================================================
// FORGOT PASSWORD
// ==================================================

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    // Don't reveal whether account exists
    if (result.rows.length === 0) {
      return res.json({
        message: "If the account exists, a reset OTP has been sent",
      });
    }

    const otp = generateOTP();

    // Remove previous reset OTP
    await pool.query(
      `DELETE FROM otp
       WHERE email = $1 AND type = 'reset_password'`,
      [email]
    );

    // Store reset OTP
    await pool.query(
      `INSERT INTO otp
       (email, otp, type, attempts, expires_at)
       VALUES ($1, $2, $3, $4, NOW() + INTERVAL '10 minutes')`,
      [email, otp, "reset_password", 0]
    );

    await sendEmail(
      email,
      "CocosCanvas - Password Reset",
      `
        <h2>Password Reset</h2>

        <p>Your password reset OTP is:</p>

        <h1>${otp}</h1>

        <p>This OTP will expire in 10 minutes.</p>
      `
    );

    res.json({
      message: "If the account exists, a reset OTP has been sent",
    });

  } catch (error) {
    console.error("Forgot password error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ==================================================
// AUTHENTICATED USER
// ==================================================

export const isAuthenticated = async (req, res) => {
  try {
    // protect middleware should already have verified JWT
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT id, name, email, is_verified
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      
      return res.status(401).json({
        authenticated: false,
      });
    }

    res.json({
      authenticated: true,
      user: result.rows[0],
    });

  } catch (error) {
    console.error("Auth check error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const getMe = async(req, res) =>{
  try{
    const userId = req.user.id

    const result = await pool.query(
      `SELECT name, email, is_verified
       FROM users
       WHERE id = $1`,
      [userId]
    );
 
    if (result.rows.length===0){
       res.status(401).json({ message: "user not found"})
    }

    else if (result.rows[0].is_verified===null){
      res.status(401).json({ message: "user is not verified"})
    }

    res.status(200).json({ user : result.rows[0]})
  }catch(error){
    console.log("get me error:", error)
    res.status(500).json({
      message: "Server error",
    });
  }
}

//logout

export const logout = async (req, res) => {
  const { email } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users
       SET is_authenticated = false
       WHERE email = $1`,
      [email]
    );

    res.status(200).json({
      message: "User logged out"
    });

  } catch (error) {
    console.log("User logout failed:", error);

    res.status(500).json({
      message: "Logout failed"
    });
  }
};