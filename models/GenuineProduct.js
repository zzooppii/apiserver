const mongoose = require('mongoose');

let date = new Date();
let dateNow = date.toFormat('YYYY-MM-DD HH24:MI:SS');

const GenuineProductSchema = mongoose.Schema({
  index : Number,
  QRCode : String,
  scan : {type : Boolean, default : false},
  userId : String,
  date : String,
});

module.exports = mongoose.model('GenuineProduct',GenuineProductSchema);
