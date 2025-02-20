const express=require('express');
const userRouter=require("./routes/user")
const landRouter=require("./routes/land")
const app=express();
const fs=require('fs');
PORT=8001
const{}=require("./middlewares")
const {connectMongodb}=require("./connection");
const logReqRes = require("./middlewares");
//mongoose connection
connectMongodb("mongodb://127.0.0.1:27017/smartlands")
    .then(console.log("mongodb connected"))

//Middlewares
app.use(express.urlencoded({extended:false}));
app.use(logReqRes("log.txt"))
//routes
app.use("/user",userRouter)
app.use("/land",landRouter)
app.listen(PORT,()=>{
    console.log(`server started at port ${PORT}..`)
})