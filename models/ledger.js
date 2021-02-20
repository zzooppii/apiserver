const mongoose = require('mongoose');
const dateFormat = require('dateformat');
require('date-utils');

let date = new Date();
let dateNow = date.toFormat('YYYY-MM-DD HH24:MI:SS');

const ledgerschema = mongoose.Schema({
  addr : String,
  from : String,
  to : String,
  description : String,
  memo : String,
  date : {type : String, default : dateNow},
  input : String,
  output : String,
  balance : Number,
  txType : String
});

module.exports = mongoose.model('accountInfo',ledgerschema);
