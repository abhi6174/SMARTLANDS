const express=require('express');
const router=express.Router();
const Land =require("../models/land")
const { getAllLands, getLandById, createLand, updateLandById, deleteLandById }=require("../controllers/land")

router.route("/")
    .get(getAllLands)
    .post(createLand)




module.exports=router