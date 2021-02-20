const mongoose = require('mongoose');

const systemInfo = mongoose.Schema({
  index : Number,
  icoType : String,
  txCount : Number,
  apiKey : String,
  admin_email : String,
  startTime : String,
  endTime : String,
  ethAddr : String,
  rate : Number,
  icoCount : Number,
  location : String,
  SMSSend : {type: Boolean, default : false},
  minAccount : {type: Number, default: '0.2' },
  maxAccount : {type: Number, default: '5000' },
  bonus: {type: Number, default: '0'},
  deskemail : {type: String, default: 'cs.wegenwallet@gmail.com'},
  sysName : String,
  testCorpNum : String,
  sendNum : String,
  reCaptcha : {type : Boolean, default : false},
  ICOLock : {type : Boolean, default : false},
  sendPermit : {type : Boolean, default : false},
  sendLock : {type : Boolean, default : false},
  latestBlock : Number,
  updateTime : String,
  testMode : {type : Boolean, default : false},
  effectDate : String
});

module.exports = mongoose.model('systemInfo',systemInfo);
