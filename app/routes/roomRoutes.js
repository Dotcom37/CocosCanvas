import express from 'express'
import { getRooms, createRoom } from '../controller/canvasController.js'
import protect from '../middleware/authMiddleware.js'
const canvasRouter = express.Router()

canvasRouter.get('/getRooms',protect, getRooms)
canvasRouter.post('/createRoom', protect, createRoom)

export default canvasRouter