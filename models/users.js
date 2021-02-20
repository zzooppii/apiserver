const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
require('date-utils');

let date = new Date();
let dateNow = date.toFormat('YYYY-MM-DD HH24:MI:SS');
let dateD = date.toFormat('YYYY-MM-DD');

const userSchema = mongoose.Schema({
  name : String,
  id : String,
  pwd : String,
  addr : String,
  phone : String,
  email : String,
  ethAddr : String,  // 2018.02.21 updated 윤성규
  subscribeDate : {type : String, default : dateNow},
  dateDay : {type : String, default : dateD},
  rxnoti : { type: Boolean, default: true  }, // added by leepg
  txnoti : { type: Boolean, default: false }, // added by leepg
  issuenoti : { type: Boolean, default: false }, // added by leepg
  pICO : {type: Boolean, default: false },    //2018.02.21 updated 윤성규
  cICO : {type: Boolean, default: false },     //2018.02.21 updated 윤성규
  otpCheck : {type : Boolean, default : false}, // 2018.03.06 updated 윤성규
  otpKey : String,  // 2018.03.06 updated 윤성규
  mypatron : String,    //자기 추천인 코드  추가 2018.07.25 조혁상
  patron : {type: String, default: '' },    //가입시 추천하는 추천인 코드 추가  2018.07.25 조혁상
  patron_name : String,                                //가입시 입력하는 추천인 코드의 주인 이름
  isAdmin : { type: Boolean, default: false},
  disabled : {type: Boolean, default : false},
});

userSchema.methods.generateHash = (password)=>{
  return bcrypt.hashSync(password,bcrypt.genSaltSync(8),null);
}

userSchema.methods.validPassword = (password,pwd) =>{
  return bcrypt.compareSync(password, pwd);
}

userSchema.methods.getRandomString = ()=>{
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 40; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

module.exports = mongoose.model('user',userSchema);
