const express=require('express');
const userRouter=require("./routes/user");
const landRouter=require("./routes/land");
const cors= require("cors");
const app=express();
const fs=require('fs');
const PORT=8001
const {connectMongodb}=require("./connection");
const logReqRes = require("./middlewares");
//mongoose connection
connectMongodb("mongodb://127.0.0.1:27017/smartlands")
    .then(console.log("mongodb connected"))

//Middlewares
app.use(cors({
    origin: 'http://localhost:5173', // Specify frontend origin
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // Allowed methods
    allowedHeaders: ['Content-Type'], // Allowed headers
  }));
app.use(express.urlencoded({extended:false}));
app.use(express.json());
//routes
app.use("/api/users",userRouter)
app.use("/api/lands",landRouter)
app.listen(PORT,()=>{
    console.log(`server started at port ${PORT}..`)
})