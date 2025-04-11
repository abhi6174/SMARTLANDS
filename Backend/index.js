require('dotenv').config();
const express = require('express');
const userRouter = require("./routes/user");
const landRouter = require("./routes/land");
const authRouter = require('./routes/authRoutes');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8002;
const { connectMongodb } = require("./connection");
const adminCheck = require('./middlewares/admin');

// Database connection
connectMongodb("mongodb://127.0.0.1:27017/smartlands")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Middleware
app.use((req, res, next) => {
  const walletAddress = req.headers['wallet-address'];
  if (walletAddress) {
    req.walletAddress = walletAddress;
  }
  next();
});

app.use(cors({
  origin: process.env.FRONTEND_URL ,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Wallet-Address'],
  exposedHeaders: ['Content-Length', 'X-Request-Id']
}));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Route reorganization
const adminLandRouter = express.Router();
adminLandRouter.use(adminCheck);
adminLandRouter.get('/', (req, res, next) => {
  // Forward to the existing lands route handler
  req.url = '/admin/lands'; // Rewrite the URL
  landRouter(req, res, next);
});

// Routes
app.use("/api/users", userRouter);
app.use("/api/lands", landRouter);
app.use('/api/auth', authRouter);

// Consolidated admin routes
app.use("/api/admin/users", adminCheck, userRouter);
app.use("/api/admin/lands", adminLandRouter);

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
 
});