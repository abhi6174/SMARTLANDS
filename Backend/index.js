require('dotenv').config();
const express = require('express');
const userRouter = require("./routes/user");
const landRouter = require("./routes/land");
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8002;
const { connectMongodb } = require("./connection");
const logReqRes = require("./middlewares");
const adminCheck = require('./middlewares/admin');
const authRoutes = require('./routes/authRoutes');

connectMongodb("mongodb://127.0.0.1:27017/smartlands")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Add wallet address extraction middleware
app.use((req, res, next) => {
  const walletAddress = req.headers['wallet-address'];
  if (walletAddress) {
    req.walletAddress = walletAddress;
  }
  next();
});

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  allowedHeaders: [
    'Content-Type',
     'Authorization', 
     'Wallet-Address'
    ],
    exposedHeaders: [
      'Content-Length',
      'X-Request-Id'
    ]
}));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(logReqRes("log.txt"));
app.use('/api/auth', authRoutes);


// Routes
app.use("/api/users", userRouter);
app.use("/api/lands", landRouter);

// Admin routes (protected)
app.use("/api/admin/users", adminCheck, userRouter);
app.use("/api/admin/lands", adminCheck, landRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error stack:', err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
   });
});

app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}..`);
});