const express = require('express');
const Land = require('../models/land');
const router = express.Router();// Import the upload middleware
const adminCheck = require('../middlewares/admin');
const {
  getUserLands,
  getNonVerifiedLands,
  getMarketplaceLands,
  createLand,
  getLandsForPayment,
  getLandsWithPurchaseRequests,
  transferLandOwnership,
  addPurchaseRequest,
  acceptPurchaseRequest,
  verifyLand

} = require("../controllers/land");


// Marketplace routes
router.get("/marketplace", getMarketplaceLands);
router.get("/getpurchase-requests", getLandsWithPurchaseRequests);

// Purchase request routes
router.post("/purchase-request", addPurchaseRequest);
router.post("/accept-purchase-request", acceptPurchaseRequest);

// Land transfer routes
router.post("/transfer", transferLandOwnership);

// CRUD routes
router.get("/lands-for-payment", getLandsForPayment);
router.route("/")
  .get(getUserLands)
  .post(createLand);

router.get("/non-verified-lands", getNonVerifiedLands);

// Add proper admin routes with middleware
router.get("/admin/lands", adminCheck, getNonVerifiedLands); 
router.post("/verify", adminCheck, verifyLand);

module.exports = router;
