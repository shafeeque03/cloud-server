import express from 'express';
import { verifyLogin, refreshAccessToken, logout } from '../controllers/userController.js';

const authRouter = express.Router();

// Auth routes
authRouter.post('/login', verifyLogin);
authRouter.post('/refresh', refreshAccessToken);
authRouter.post('/logout', logout);

export default authRouter;