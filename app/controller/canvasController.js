import prisma from "../lib/prisma.js";
import crypto from "crypto";

export const getRooms = async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      where: {
        OR: [
          {
            createdBy: req.user.email,
          },
          {
            members: {
              some: {
                user: {
                  email: req.user.email,
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        createdAt: true,
        title: true,
        createdBy: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      rooms: rooms.map((room) => ({
        id: room.id,
        created_at: room.createdAt,
        title: room.title,
        created_by: room.createdBy,
      })),
    });
  } catch (err) {
    console.error(
      "faced problem while fetching room data:",
      err.message
    );

    res.status(500).json({
      message: "Failed to fetch rooms",
    });
  }
};

export const createRoom = async (req, res) => {
  while (true) {
    try {
      const { title } = req.body;

      const id = crypto.randomUUID();

      const room = await prisma.room.create({
        data: {
          id: id,
          title: title,
          createdBy: req.user.email,
        },
        select: {
          id: true,
          createdBy: true,
        },
      });

      res.status(200).json({
        message: "new room created",
        roomData: {
          id: room.id,
          created_by: room.createdBy,
        },
      });

      break;
    } catch (error) {
      // Prisma equivalent of PostgreSQL unique violation
      if (error.code === "P2002") {
        continue;
      }

      console.error("Error creating room:", error.message);

      return res.status(500).json({
        message: "Failed to create room",
      });
    }
  }
};