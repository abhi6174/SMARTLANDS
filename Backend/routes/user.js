const express=require('express');
const router=express.Router();
const User =require("../models/user")
const { 
  handleGetAllUsers,
  checkUserAuthorization,
  handleGetUserById,
  getAdminWallet,
  handleUpdateUserById,
  handleCreateNewUser,
  handleDeleteUser
 }=require("../controllers/user")

 const adminCheck = require('../middlewares/admin');


// Regular user routes
router.route("/")
  .get(handleGetAllUsers)
  .post(handleCreateNewUser);

router.route('/:id')
  .get(handleGetUserById)
  .patch(handleUpdateUserById);

// Admin-protected routes
router.route("/admin/users/:id")
  .delete(adminCheck, handleDeleteUser);

router.get('/admin/wallet', adminCheck, getAdminWallet);
router.get('/check-auth', checkUserAuthorization);

module.exports=router