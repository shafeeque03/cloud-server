import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/userModel.js';
// Assuming you have a User model/database connection
// import User from '../models/User';

// Environment variables should be used for sensitive information
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'your_access_token_secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_secret';
const ACCESS_TOKEN_EXPIRY = '15m'; // Short-lived token
const REFRESH_TOKEN_EXPIRY = '7d'; // Long-lived token

// Store for refresh tokens - in production, use Redis or a database
const refreshTokens = new Set();

// Generate tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { 
      id: user.id,
      email: user.email,
      role: user.role 
    }, 
    ACCESS_TOKEN_SECRET, 
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
  
  const refreshToken = jwt.sign(
    { 
      id: user.id,
      tokenId: uuidv4() 
    }, 
    REFRESH_TOKEN_SECRET, 
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
  
  // Store refresh token
  refreshTokens.add(refreshToken);
  
  return { accessToken, refreshToken };
};

const securePassword = async (password) => {
    try {
      const passwordHash = await bcrypt.hash(password, 10);
      return passwordHash;
    } catch (error) {
      console.log(error.message);
    }
  };

// Verify login controller
export const verifyLogin = async (req, res) => {
  try {
    const { loginId, password } = req.body;
    
    if (!loginId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Login ID and password are required'
      });
    }
    
    // Find user by loginId (email or username)
    // Replace this with your actual user lookup logic
    const user = await User.findOne({loginId:loginId});
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);
    
    // Send tokens (refreshToken as httpOnly cookie)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    // User data to return (exclude sensitive info)
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      // Add other non-sensitive user fields
    };
    
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      accessToken,
      user: userData
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Refresh token controller
export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not found'
      });
    }
    
    // Check if refresh token exists in store
    if (!refreshTokens.has(refreshToken)) {
      return res.status(403).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
    
    // Verify refresh token
    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        // Remove invalid token
        refreshTokens.delete(refreshToken);
        return res.status(403).json({
          success: false,
          message: 'Invalid refresh token'
        });
      }
      
      // Find user
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
      
      // Remove old refresh token and add new one
      refreshTokens.delete(refreshToken);
      
      // Set new refresh token as cookie
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      // User data to return
      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        // Add other non-sensitive user fields
      };
      
      return res.status(200).json({
        success: true,
        accessToken,
        user: userData
      });
    });
    
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Logout controller
// Logout controller
export const logout = async (req, res) => {
    try {
      // The issue is here - accessing cookies
      const refreshToken = req.cookies?.refreshToken;
      // Remove token from store
      if (refreshToken) {
        refreshTokens.delete(refreshToken);
      }
      
      // Clear cookie
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      return res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
      
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

// Authentication middleware
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token is required'
    });
  }
  
  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    
    req.user = decoded;
    next();
  });
};

// const createUser = async(req,res)=>{
//     console.log("user created");
//     try {
//         const password = "Admin@123";
//         const hashed = await securePassword(password);
//         const newUser = await User.create({
//             name:"Cloud-Admin",
//             loginId:"cloudadmin@gmail.com",
//             password:hashed,
//         })
//         await newUser.save();
//         console.log("user created");
//     } catch (error) {
//         console.log(error)
//     }
// }

// createUser();

export const getUserProfile = async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId).select('-password');
    //   console.log("here")
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: 'admin'
          // Add any other fields you want to return
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
  
  // Update user profile
  export const updateUserProfile = async (req, res) => {
    try {
      const userId = req.user.id;
      const { name, email } = req.body;
      
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Update fields if provided
      if (name) user.name = name;
      if (email) user.email = email;
      
      // Save updates
      await user.save();
      
      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };