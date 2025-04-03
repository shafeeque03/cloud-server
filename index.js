import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import helmet from 'helmet'; // For securing HTTP headers
import fileUpload from 'express-fileupload';
// import rateLimit from 'express-rate-limit'; // For rate limiting
import mongoSanitize from 'express-mongo-sanitize'; // For preventing NoSQL injections
import hpp from 'hpp'; // For preventing HTTP parameter pollution
import dbconnect from './config/Database.js';
import userRoute from './routes/userRoute.js';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import User from './models/userModel.js';

dotenv.config();
dbconnect();

const app = express();
const port = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



// 3. Prevent NoSQL Injection
app.use(mongoSanitize({
  replaceWith: '_',
}));

app.use(hpp({
  whitelist: []
}));

app.use(compression());

app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));



app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Content-Disposition"],  // Allow browsers to access filename
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

// const securePassword = async (password) => {
//     try {
//       const passwordHash = await bcrypt.hash(password, 10);
//       return passwordHash;
//     } catch (error) {
//       console.log(error.message);
//     }
//   };

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


// Body Parsers
app.use(express.json({
  limit: '50mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch(e) {
      res.status(400).json({ error: 'Invalid JSON' });
      throw new Error('Invalid JSON');
    }
  }
}));

app.use(express.urlencoded({ 
  limit: '50mb', 
  extended: true 
}));

// Routes
app.use('/api/', userRoute);
// Serve Static Files for Vite React project
// app.use(express.static(path.join(__dirname, "view")));

// Redirect unknown routes to index.html
// app.get("/*", (req, res) => {
//   res.sendFile(path.join(__dirname, "view", "index.html"));
// });
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || "error";

  // Send the error response to the client
  res.status(statusCode).json({
    status,
    message: err.message || "An unexpected error occurred.",
  });
});
// Server Creation
const server = http.createServer(app);
server.listen(port, () => console.log(`Working on port ${port} ⚡️`));
