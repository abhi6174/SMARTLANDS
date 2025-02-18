const express=require('express');
const router=express.Router();
const User =require("../models/user")
const { handleGetAllUsers,handleGetUserById,handleUpdateUserById,handleCreateNewUser }=require("../controllers/user")

router.route("/")
    .get(handleGetAllUsers)
    .patch(handleCreateNewUser)

router.route('/:id')
    .get(handleGetUserById)
    .patch(handleUpdateUserById)


module.exports=router