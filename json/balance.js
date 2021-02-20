const express = require('express');
const router = express.Router();

const ledger = require('../models/ledger.js');
const userInfo = require('../models/users.js');

const multichain = require('../middleware/multichain-conn.js');
const WeGen_conf = require('../helpers/conf.json')

let unkownUser = {
  "Result" : "Failure",
  "Message" : "가입되지 않은 이메일주소입니다.",
  "EpAddr" : ""
}

router.post('/balance',(req,res)=>{
  req.on('data', (data) => {
    try {
      inputData = JSON.parse(data);
    } catch (e) {
      console.log(e);
    } finally {

    }
  });

  req.on('end',()=>{
    userInfo.findOne({'email':inputData.UserId},(err,userResult)=>{
      if(err){
        console.log(err);
      }else{
        if(!userResult){
          return res.json(unkownUser);
        }else{
          multichain.getAddressBalances({address : userResult.addr},(err,asset)=>{
            if(err){

            }else{
              if(!asset){

              }else{
                let balance = 0;

                for(let index in asset){
                  if(asset[index].name == WeGen_conf.assetname){
                    for(let key in asset[index]){
                      if(key == 'qty'){
                        balance = asset[index][key];
                      }
                    }
                  }
                }

                let result = {
                  'Result' : 'Success',
                  'Message' : '조회 성공',
                  'Balance' : balance
                }

                return res.json(result);
              }
            }
          })
        }
      }
    })
  })
});

module.exports = router;
