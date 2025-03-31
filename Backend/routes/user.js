const express = require('express');
const router = express.Router();
const { 
  handleGetAllUsers,
  handleGetUserById,
  handleUpdateUserById,
  handleCreateNewUser,
  getAdminWallet,
  checkUserAuthorization
} = require("../controllers/user");

const adminCheck = require('../middlewares/admin');

// Regular user routes
router.route("/")
  .get(handleGetAllUsers)
  .post(handleCreateNewUser);

router.route('/:id')
  .get(handleGetUserById)
  .patch(handleUpdateUserById);

// Admin-protected routes
router.get('/admin/wallet', adminCheck, getAdminWallet);
router.get('/check-auth', checkUserAuthorization);
router.get('/admin/users', adminCheck, handleGetAllUsers);

module.exports = router;