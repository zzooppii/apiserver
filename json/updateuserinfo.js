const express = require('express');
const router = express.Router();
const async = require('async');
const userInfo = require('../models/users.js');

router.post('/updateuserinfo',(req,res)=>{
  req.on('data', (data) => {
    try {
      inputData = JSON.parse(data);
    } catch (e) {
      console.log(e);
    } finally {

    }
  });

  req.on('end',()=>{
    async.waterfall([
      function(callback){
        userInfo.findOne({'email':inputData.UserId},(err,userResult)=>{
          if(err){
            callback(true,'err');
            return;
          }else{
            if(!userResult){
              callback(true,'nouser')
              return;
            }else{
              callback(null);
            }
          }
        })
      },

      function(callback){
        userInfo.update({'email':inputData.UserId},{$set:{'name':inputData.Name,'phone':inputData.TelNo}},(err,result)=>{
          if(err){
            throw err;
          }
          callback(null,"success");
        });
      }
    ],function(err,result){
      if(result == 'err'){
        let result = {
          "Result" : "Failure",
          "Message" : "시스템 오류"
        }
        return res.json(result);
      }else if(result == 'ethErr'){
        let result = {
          "Result" : "Failure",
          "Message" : "시스템 오류"
        }
        return res.json(result);
      }else if(result == 'nouser'){
        let result = {
          "Result" : "Failure",
          "Message" : "사용자 정보 오류"
        }
        return res.json(result);
      }else{
        let result = {
          "Result" : "Success",
          "Message" : "회원정보 변경 성공"
        }
        return res.json(result);
      }
    });
  });
});

module.exports = router;
