// backend/index.js
require('dotenv').config();
const express = require('express');
const userRouter = require("./routes/user");
const landRouter = require("./routes/land");
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8002;
const { connectMongodb } = require("./connection");
const logReqRes = require("./middlewares");

connectMongodb("mongodb://127.0.0.1:27017/smartlands")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/api/users", userRouter);
app.use("/api/lands", landRouter);

app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}..`);
});