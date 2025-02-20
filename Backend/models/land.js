const mongoose = require('mongoose');


// Define schema & model
const landSchema= new mongoose.Schema({
  ownerName: {

    type:String,
    required:true,
  },
  landArea: {

    type:Number,
    required:true,
  },

  district: {

    type:String,
    required:true,
  },
  taluk: {
    type:String,
    required:true,
  },
  village:{

    type:String,
    required:true,
  } ,
  blockNumber:{

    type:Number,
    required:true,
  } ,
   surveyNumber:{

    type:Number,
    required:true,
  } 

})
const Land=mongoose.model("land",landSchema);

module.exports= Land;


  

