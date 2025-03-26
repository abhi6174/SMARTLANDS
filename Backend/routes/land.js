// File: backend/routes/land.js

const express = require('express');
const router = express.Router();
const adminCheck = require('../middlewares/admin');
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
  getNonVerifiedLands,
  verifyLand

} = require("../controllers/land");

// Define the /marketplace route BEFORE the /:id route
router.get("/marketplace", getMarketplaceLands);
router.get("/getpurchase-requests", getLandsWithPurchaseRequests);
router.route("/")
  .get(getAllLands)
  .post(createLand);

router.route("/:id")
  .get(getLandById)
  .put(updateLandById)
  .delete(deleteLandById);

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
module.exports = router;