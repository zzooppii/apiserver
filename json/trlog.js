const express = require('express');
const router = express.Router();
const moment = require('moment');

const ledger = require('../models/ledger.js');
const userInfo = require('../models/users.js');

const multichain = require('../middleware/multichain-conn.js');
const WeGen_conf = require('../helpers/conf.json')

let trlogErr = {
  'Result' : 'Failure',
  'Messsage' : '에러',
  'Balance' : '',
  'TrLog' : ''
}

let unkownUser = {
  "Result" : "Failure",
  "Message" : "가입되지 않은 이메일주소입니다.",
  "EpAddr" : ""
}

router.post('/trlog',(req,res)=>{
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
                return res.json(unkownUser);
              }else{
                ledger.find({'from':inputData.UserId},(err,ledgerResult)=>{
                  if(err){

                  }else{
                    if(!ledgerResult){

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

                      let trlog = [];
                      for(let index in ledgerResult){
                        //let m = moment();
                        //m = moment(ledgerResult[index].date);
                        //m.format('yymmddhMMss,')
                        //input == 나한테 들어온돈

                        let pre_bal = 0;
                        let amt = 0;
                        let post_bal = ledgerResult[index].balance;
                        let trType = "D";

                        if(Number(ledgerResult[index].input)>0){
                          trType = "D";
                          amt = ledgerResult[index].input;
                        }else{
                          trType = "W";
                          amt = ledgerResult[index].output;
                        }

                        if(ledgerResult[index].txType == 'issue' || ledgerResult[index].txType == 'icoTest' || ledgerResult[index].txType == 'ico'){
                          if(userResult.isAdmin){
                            pre_bal = "0";
                            post_bal = "0";
                          }else{
                            if(!ledgerResult[index].balance){
                              pre_bal = 0;
                            }else{
                              pre_bal = post_bal - amt;
                            }
                          }
                        }else{
                          if(Number(ledgerResult[index].input)>0){
                            pre_bal = ledgerResult[index].balance - ledgerResult[index].input;
                          }else{
                            pre_bal = ledgerResult[index].balance + ledgerResult[index].output;
                          }
                        }

                        if(amt == ""){
                          amt = 0;
                        }

                        let m;
                        var regExp = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;

                        if(regExp.test(ledgerResult[index].date)){
                          m = ledgerResult[index].date.replace(regExp,"");
                          m = m.replace(/ /gi, "");
                        }

                        let log = {
                          "PRE_BAL": pre_bal, //이전 밸런스
                          "TR_TYPE": trType,
                          "MEMO": ledgerResult[index].memo,
                          "EP2": ledgerResult[index].to,
                          "TR_DATETIME": m,
                          "TR_MNGNO": m, //?
                          "ABSTRACT": null, //?
                          "POST_BAL": post_bal, //이후 밸런스
                          "TR_AMT": amt, //입금액 or 출금액
                          "EP": ledgerResult[index].from,
			                    "DESCRIPTION" : ledgerResult[index].description
                        };

                        trlog[index] = log;
                      }

                      let result = {
                        'Result' : 'Success',
                        'Message' : "거래내역 조회 성공",
                        'Balance' : balance,
                        'TrLog' : trlog
                      }

                      res.json(result);
                    }
                  }
                })
              }
            }
          })
        }
      }
    });
  });
});

module.exports = router;
