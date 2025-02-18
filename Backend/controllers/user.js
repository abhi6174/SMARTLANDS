const User= require("../models/user")
async function handleGetAllUsers(req,res){
    const allusers= await User.find({})
    return res.json(allusers)
}
async function handleGetUserById(req,res){     
    const user= await User.findById(req.params.id)
    if(!user) return res.status(201).json({error:"user not found"})
    return res.json(user);
}
async function handleUpdateUserById(req,res){
    await User.findByIdAndUpdate(req.params.id,{email:"changed"})
    return res.json({status:"success"});
}
async function handleCreateNewUser(req,res){
    console.log(body)
    if(
        !body||
        !body.name||
        !body.email
    ){
        return res.status(400).json("All fields are required")
    }
    const result= await User.create({
        name:body.name,
        email:body.email
    })
    console.log("result",result)
    return res.status(201).json({msg:"sucess"})
}
module.exports={
    handleGetAllUsers,
    handleGetUserById,
    handleUpdateUserById,
    handleCreateNewUser
}