const express = require('express');
const router = express.Router();
const { getAllLands, getLandById, createLand, updateLandById, deleteLandById } = require('../controllers/landController');

router.route("/")
  .get(getAllLands)
  .post(createLand);

router.route("/:id")
  .get(getLandById)
  .put(updateLandById)
  .delete(deleteLandById);

module.exports = router;
