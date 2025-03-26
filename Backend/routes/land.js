const express = require('express');
const router = express.Router();// Import the upload middleware
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
  // New controller function for document uploads
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

module.exports = router;