const express = require('express');
const router = express.Router();
const { getAllLands, getLandById, createLand,getLandHistory,transferLandOwnership, updateLandById, deleteLandById, } = require("../controllers/land");

router.route("/")
  .get(getAllLands)
  .post(createLand);

router.route("/:id")
  .get(getLandById)
  .put(updateLandById)
  .delete(deleteLandById);
router.post("/transfer", transferLandOwnership);
router.get("/history/:landId", getLandHistory);
module.exports = router;
