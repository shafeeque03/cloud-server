import express from 'express';
import { verifyLogin } from '../controllers/userController.js';
const userRoute = express.Router();
userRoute.post('/auth/login',verifyLogin)

export default userRoute