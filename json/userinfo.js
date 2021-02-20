const express = require('express');
const router = express.Router();

const userInfo = require('../models/users.js');

router.post('/userinfo',(req,res)=>{
  req.on('data', (data) => {
    try {
      inputData = JSON.parse(data);
    } catch (e) {
      console.log(e);
    } finally {

    }
  });

  req.on('end',()=>{
    userInfo.findOne({'email':inputData.UserId},(err,user)=>{
      if(err){
        console.log(err);
      }else{
        if(!user){
          return res.json(unkownUser);
        }else{
          let result = {
            "Result" : "Success",
            "Message" : "회원정보 조회 성공",
            "UserName" : user.name,
            "TelNo" : user.phone
          }
          return res.json(result);
        }
      }
    })
  })
})

module.exports = router;
