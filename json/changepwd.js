const express = require('express');
const async = require('async')
const router = express.Router();

const userInfo = require('../models/users.js');

router.post('/changepwd',(req,res)=>{
  req.on('data', (data) => {
    try {
      inputData = JSON.parse(data);
    } catch (e) {
      console.log(e);
    } finally {

    }
  });

  req.on('end',()=>{
    //1.기존비밀번호와 동일
    //2.특수문자8자리 포함
    //3.현재 비밀번호가 다름

    let newHashPwd;

    async.waterfall([
      function(callback){
        userInfo.findOne({'email':inputData.UserId},(err,user)=>{
          if(err){
            callback(true,'err');
            return;
          }else{
            if(!user){
              callback(true,'err');
              return;
            }else{
              let _reg = new userInfo();
              newHashPwd = _reg.generateHash(inputData.NewPassword);
              if(newHashPwd == user.pwd){
                //기존 비밀번호와 같을 때
                callback(true,'samePwd');
                return;
              }

              var regExpPw =/^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,16}$/;
              if(!regExpPw.test(inputData.NewPassword)){
                //비밀번호 특문,영문,숫자 8자리
                callback(true,'pwdReg');
                return;
              }

              callback(null,user);
            }
          }
        })
      },function(data,callback){
        userInfo.update({'email':inputData.UserId},{$set:{'pwd':newHashPwd}},(err,user)=>{
          if(err){
            callback(true,'err');
            return;
          }else{
            callback(null,'success');
          }
        })
      }
    ],function(err,result){
      if(result == 'err'){
        let jsonRes = {
          'Result' : 'Failure',
          'Message' : '시스템 오류발생.'
        }
        return res.json(jsonRes)
      }else if(result == 'samePwd'){
        let jsonRes = {
          'Result' : 'Failure',
          'Message' : '기존 비밀번호와 동일합니다.',
        }
        return res.json(jsonRes);
      }else if(result == 'pwdReg'){
        let jsonRes = {
          'Result' : 'Failure',
          'Message' : '비밀번호 형식이 맞지 않습니다.',
        }
        return res.json(jsonRes);
      }else{
        let jsonRes = {
          'Result' : 'Success',
          'Message' : '비밀번호 변경 성공'
        }
        return res.json(jsonRes);
      }
    });
  });
})

module.exports = router;
