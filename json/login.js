const express = require('express');
const router = express.Router();

const userInfo = require('../models/users.js');

router.get('/login',(req,res)=>{
  userInfo.find({},(err,users)=>{
    if(err){
      console.log(err);
    }else{
      return res.json(users);
    }
  })

});

let unkownUser = {
  "Result" : "Failure",
  "Message" : "가입되지 않은 이메일주소입니다.",
  "EpAddr" : ""
}

let wrongPwd = {
  "Result" : "Failure",
  "Message" : "비밀번호가 잘못되었습니다.",
  "EpAddr" : ""
}

router.post('/login',(req,res)=>{
  req.on('data', (data) => {
    try {
      inputData = JSON.parse(data);
    } catch (e) {
      console.log(e);
    } finally {

    }
  });

  req.on('end',()=>{
    //inputData.UsimId;
    //inputData.DeviceTelNo;
    //inputData.UserId;
    //inputData.Passwrod;

    console.log(inputData.UserId);
    console.log(inputData.Password);

    userInfo.findOne({'email':inputData.UserId},(err,user)=>{
      if(err){
        console.log(err);
      }else{
        if(!user){
          return res.json(unkownUser);
        }else{
          if(!inputData.Password || !user.validPassword(inputData.Password,user.pwd)){
            return res.json(wrongPwd);
          }
          console.log(user);
          let result = {
            "Result" : "Success",
            "Message" : "로그인에 성공하였습니다.",
            "EpAddr" : user.addr
          }
          return res.json(result);
        }
      }
    })
  })
})

module.exports = router;
