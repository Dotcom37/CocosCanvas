import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "../lib/prisma.js";

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
    console.log("babla")
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }
    console.log("babla2") 
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    console.log("babla3")
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
        isVerified: false,
      },
    });

    const userId = user.id;

    // Generate OTP
    const otp = generateOTP();

    // Delete previous signup OTP
    await prisma.otp.deleteMany({
      where: {
        email: email,
        type: "signup",
      },
    });

    // Store OTP
    await prisma.otp.create({
      data: {
        userId: userId,
        email: email,
        otp: otp,
        type: "signup",
        attempts: 0,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    // Send OTP
    await sendEmail(
      email,
      "CocosCanvas - Verify your account",
      `
        <h2>Welcome to CocosCanvas!</h2>

        <p>Your verification OTP is:</p>

        <h1>${otp}</h1>

        <p>This OTP will expire in 10 minutes.</p>
      `,
    );

    return res.status(201).json({
      message: "Signup successful. OTP sent to your email.",
    });
  } catch (error) {
    console.error("Signup error:", error);

    return res.status(500).json({
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

    const otpRecord = await prisma.otp.findFirst({
      where: {
        email: email,
        type: "signup",
      },
      orderBy: {
        id: "desc",
      },
    });

    if (!otpRecord) {
      return res.status(400).json({
        message: "OTP not found",
      });
    }

    // Check expiry
    if (otpRecord.expiresAt < new Date()) {
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
      await prisma.otp.update({
        where: {
          id: otpRecord.id,
        },
        data: {
          attempts: {
            increment: 1,
          },
        },
      });

      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    // Verify user
    await prisma.user.update({
      where: {
        email: email,
      },
      data: {
        isVerified: true,
      },
    });

    // Delete used OTP
    await prisma.otp.delete({
      where: {
        id: otpRecord.id,
      },
    });

    // Get verified user
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
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
      },
    );

    return res.json({
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

    return res.status(500).json({
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

    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Check password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password,
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Check email verification
    if (!user.isVerified) {
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
      },
    );

    return res.json({
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

    return res.status(500).json({
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

    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    // Don't reveal whether account exists
    if (!user) {
      return res.json({
        message: "If the account exists, a reset OTP has been sent",
      });
    }

    const otp = generateOTP();

    // Remove previous reset OTP
    await prisma.otp.deleteMany({
      where: {
        email: email,
        type: "reset_password",
      },
    });

    // Store reset OTP
    await prisma.otp.create({
      data: {
        userId: user.id,
        email: email,
        otp: otp,
        type: "reset_password",
        attempts: 0,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    await sendEmail(
      email,
      "CocosCanvas - Password Reset",
      `
        <h2>Password Reset</h2>

        <p>Your password reset OTP is:</p>

        <h1>${otp}</h1>

        <p>This OTP will expire in 10 minutes.</p>
      `,
    );

    return res.json({
      message: "If the account exists, a reset OTP has been sent",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
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

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        isVerified: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        authenticated: false,
      });
    }

    return res.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        is_verified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Auth check error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// ==================================================
// GET ME
// ==================================================

export const getMe = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.User.findUnique({
      where: {
        id: userId,
      },
      select: {
        name: true,
        email: true,
        isVerified: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "user not found",
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        message: "user is not verified",
      });
    }

    return res.status(200).json({
      user: {
        name: user.name,
        email: user.email,
        is_verified: user.isVerified,
      },
    });
  } catch (error) {
    console.log("get me error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};