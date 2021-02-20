const express = require('express');
const router = express.Router();

const userInfo = require('../models/users.js');
const multichain = require('../middleware/multichain-conn.js');
const WeGen_conf = require('../helpers/conf.json')

let jsonForm = {
  Result : '',
  Message : ''
}

router.post('/register',(req,res)=>{
  req.on('data', (data) => {
    try {
      inputData = JSON.parse(data);
    } catch (e) {
      console.log(e);
    } finally {

    }
  });

  req.on('end',()=>{
    inputData.UserId;
    inputData.Password;
    inputData.TelNo;
    inputData.UserName;

    let newUser = new userInfo();

    newUser.email = inputData.UserId;
    newUser.pwd = newUser.generateHash(inputData.Password);
    newUser.name = inputData.UserName;
    newUser.phone = inputData.TelNo;

    userInfo.findOne({email:newUser.email},(err,user)=>{
      if(err){
        throw err;
      }else{
        if(!user){
          multichain.getNewAddress((err,addr)=>{
            if(err){
              throw err;
            }else{
              multichain.grantFrom({from:WeGen_conf.multichainAdminAddress, to:addr,permissions:'send,receive'},(err,data)=>{
                if(err){
                  throw err;
                }else{
                  newUser.addr = addr;

                  userInfo.save((err)=>{
                    if(err){
                      throw err;
                    }else{
                      //회원가입 성공
                      jsonForm.Result = 'Success';
                      jsonForm.Message = "회원가입에 성공하였습니다.";

                      return res.json(jsonForm);
                    }
                  })
                }
              })
            }
          });
        }else{
          //이미 존재하는 사용자
          jsonForm.Result = "Failure";
          jsonForm.Messsage = "이미 존재하는 아이디입니다.";

          return res.json(jsonForm);
        }
      }
    })
  })
})

module.exports = router;
