const express=require('express');
const userRouter=require("./routes/user")
const app=express();
const fs=require('fs');
PORT=8000
const{}=require("./middlewares")
const {connectMongodb}=require("./connection");
const logReqRes = require("./middlewares");
//mongoose connection
connectMongodb("mongodb://127.0.0.1:27017/userdata")
    .then(console.log("mongodb connected"))

//Middlewares
app.use(express.urlencoded({extended:false}));
app.use(logReqRes("log.txt"))
//routes
app.use("/user",userRouter)
app.listen(PORT,()=>{
    console.log(`server started at port ${PORT}..`)
})