import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { getUserProfile, updateUserProfile } from '../controllers/userController.js';
import { createFolder, fetchAllFolders, fetchChildFolders, renameFolder } from '../controllers/appController.js';

const userRouter = express.Router();

// Protected routes
userRouter.get('/profile', authenticateToken, getUserProfile);
userRouter.put('/profile', authenticateToken, updateUserProfile);

userRouter.post('/create-folder', authenticateToken, createFolder)
userRouter.patch('/rename-folder', authenticateToken, renameFolder)
userRouter.get('/fetch-home', authenticateToken, fetchAllFolders)
userRouter.get('/fetch-child-folders/:folderId', authenticateToken, fetchChildFolders)

export default userRouter;