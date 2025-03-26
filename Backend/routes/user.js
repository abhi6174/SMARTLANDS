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
<<<<<<< HEAD
    .get(handleGetUserById)
    .patch(handleUpdateUserById)
    
    module.exports=router;
=======
  .get(handleGetUserById)
  .patch(handleUpdateUserById);

// Admin-protected routes
router.route("/admin/users/:id")
  .delete(adminCheck, handleDeleteUser);

router.get('/admin/wallet', adminCheck, getAdminWallet);
router.get('/check-auth', checkUserAuthorization);

module.exports=router
>>>>>>> f770ea13b91d0b2e6ffea6ec0136dee18710ee81
