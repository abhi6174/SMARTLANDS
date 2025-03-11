// File: backend/routes/land.js

const express = require('express');
const router = express.Router();
const {
  getAllLands,
  getMarketplaceLands,
  getLandById,
  createLand,
  getLandHistory,
  transferLandOwnership,
  updateLandById,
  deleteLandById,
  acceptPurchaseRequest,
} = require("../controllers/land");

// Define the /marketplace route BEFORE the /:id route
router.get("/marketplace", getMarketplaceLands);

router.route("/")
  .get(getAllLands)
  .post(createLand);

router.route("/:id")
  .get(getLandById)
  .put(updateLandById)
  .delete(deleteLandById);

router.post("/transfer", transferLandOwnership);
router.get("/history/:landId", getLandHistory);
router.post("/accept-purchase-request", acceptPurchaseRequest);
module.exports = router;