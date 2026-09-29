import pool from "../lib/db.js";
import crypto from "crypto"

export const getRooms = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT r.id, r.created_at, r.title, r.created_by
       FROM rooms r
       LEFT JOIN room_members rm
         ON r.id = rm.room_id
       LEFT JOIN users u
         ON rm.user_id = u.id
       WHERE r.created_by = $1
          OR u.email = $1
       ORDER BY r.created_at DESC`,
      [req.user.email]
    );

    res.status(200).json({
      rooms: result.rows
    });

  } catch (err) {
    console.error("faced problem while fetching room data:", err.message);

    res.status(500).json({
      message: "Failed to fetch rooms",
    });
  }
};

export const createRoom = async(req, res) =>{
    while(true){
        try{
            const { title } = req.body
            const id = crypto.randomUUID()
        
            const result = await pool.query(`
            INSERT INTO Rooms 
            (id, title, created_by)
            VALUES($1,$2,$3)
            returning id, created_by`,
            [id, title, req.user.email] 
            )

            res.status(200).json({
                message:"new room created",
                roomData: result.rows[0]
            })

            break;
        }catch(error){
            if (error.code === "23505") continue

            console.error("Error creating room:", error.message);

            return res.status(500).json({
                message: "Failed to create room"
            });
        }
    }

}

