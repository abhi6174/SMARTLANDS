const express = require('express');
<<<<<<< HEAD
const router = express.Router();// Import the upload middleware
=======
const router = express.Router();
const adminCheck = require('../middlewares/admin');
>>>>>>> f770ea13b91d0b2e6ffea6ec0136dee18710ee81
const {
  getAllLands,
  getMarketplaceLands,
  getLandById,
  createLand,
  getLandHistory,
  getLandsWithPurchaseRequests,
  transferLandOwnership,
  updateLandById,
  deleteLandById,
  addPurchaseRequest,
  acceptPurchaseRequest,
<<<<<<< HEAD
  // New controller function for document uploads
=======
  getNonVerifiedLands,
  verifyLand

>>>>>>> f770ea13b91d0b2e6ffea6ec0136dee18710ee81
} = require("../controllers/land");


// Marketplace routes
router.get("/marketplace", getMarketplaceLands);
router.get("/getpurchase-requests", getLandsWithPurchaseRequests);

// Purchase request routes
router.post("/purchase-request", addPurchaseRequest);
router.post("/accept-purchase-request", acceptPurchaseRequest);

// Land transfer routes
router.post("/transfer", transferLandOwnership);
router.get("/history/:landId", getLandHistory);

// CRUD routes
router.route("/")
  .get(getAllLands)
  .post(createLand);

router.route("/:id")
  .get(getLandById)
  .put(updateLandById)
  .delete(deleteLandById);

<<<<<<< HEAD
=======
router.get("/non-verified-lands", getNonVerifiedLands);
router.post("/verify-land", verifyLand);

router.post("/admin/lands/verify", verifyLand);
// Add proper admin routes with middleware
router.get("/admin/lands", adminCheck, async (req, res) => {
  try {
    const lands = await Land.find({});
    res.json(lands);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch lands" });
  }
});
router.get('/admin/lands/pending', adminCheck, getNonVerifiedLands);
router.post("/transfer", transferLandOwnership);
module.exports = router;
router.get("/history/:landId", getLandHistory);
router.post("/purchase-request", addPurchaseRequest);
router.post("/accept-purchase-request", acceptPurchaseRequest);
>>>>>>> f770ea13b91d0b2e6ffea6ec0136dee18710ee81
module.exports = router;