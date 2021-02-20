const express = require('express');
const router = express.Router();
const async = require('async');

const ledger = require('../models/ledger.js');
const userInfo = require('../models/users.js');

const multichain = require('../middleware/multichain-conn.js');
const WeGen_conf = require('../helpers/conf.json');

router.post('/withdrawal',(req,res)=>{
  req.on('data', (data) => {
    try {
      inputData = JSON.parse(data);
    } catch (e) {
      console.log(e);
    } finally {

    }
  });

  req.on('end',()=>{
    const fromEmail = inputData.UserId;
    const toEmail = inputData.DepositEp;
    const amount = inputData.TrAmt;
    const memo = inputData.Memo;

    const qty = Number(amount);

    let now = new Date();
    async.waterfall([
      function(callback){
        userInfo.findOne({'email':fromEmail},(err,fromResult)=>{
          if(err){
            callback(true,"mongodb_err");
            return;
          }else{
            if(fromResult == null){
              callback(true,"mongodb_null1");
              return;
            }else{
              callback(null,fromResult);
            }
          }
        });
      },

      function(fromResult,callback){
        userInfo.findOne({'email': toEmail,'disabled':false},(err,toResult)=>{
          if(err){
            callback(true,"mongodb_err");
            return;
          }else{
            if(toResult == null){
              userInfo.findOne({'addr':toEmail,'disabled' : false},(err,toResult)=>{
                if(err){
                  callback(true,"mongodb_err");
                  return;
                }else{
                  if(toResult == null){
                    callback(true,"mongodb_null2");
                    return;
                  }else{
                    callback(null,fromResult,toResult);
                    return;
                  }
                }
              });
            }else{
              callback(null,fromResult,toResult);
              return;
            }
          }
        });
      },
      function(from,to,callback){
        multichain.listPermissions({permissions:'send',addresses : from.addr},(err,permissions)=>{
          if(err){
            callback(true,"multichain_err");
            return;
          }else{
            if(permissions.length ==0){
              callback(true,"permissions_send");
              return;
            }else{
              callback(null,from,to);
            }
          }
        })
      },
      function(from,to,callback){
        multichain.listPermissions({permissions:'receive',addresses : to.addr},(err,permissions)=>{
          if(err){
            callback(true,"multichain_err");
            return;
          }else{
            if(permissions.length ==0){
              callback(true,"permissions_receive");
              return;
            }else{
              callback(null,from,to);
            }
          }
        })
      },
      function(from,to,callback){
        multichain.getAddressBalances({address : from.addr},(err,fromAsset)=>{
          if(err){
            callback(true,"multichain_err");
            return;
          }else{
            multichain.getAddressBalances({address: to.addr},(err,toAsset)=>{
              if(err){
                callback(true,"multichain_err");
                return;
              }else{
                let fromBalance;

                for(let index in fromAsset){
                  if(fromAsset[index].name == WeGen_conf.assetname){
                    for(let key in fromAsset[index]){
                      if(key == 'qty'){
                        frombalance = fromAsset[index][key];
                      }
                    }
                  }
                }

                if(amount > fromBalance){
                  callback(true,"no_balance");
                  return;
                }else{
                  callback(null,from,to);
                }
              }
            });
          }
        });
      },

      function(from,to,callback){
        multichain.sendAssetFrom({
          from : from.addr,
          to: to.addr,
          asset : WeGen_conf.assetname,
          qty : qty
        },(err,data)=>{
          if(err){
            callback(true,"multchain_err");
            return;
          }else{
            callback(null,from,to);
          }
        });
      },

      function(from,to,callback){
        multichain.getAddressBalances({address : from.addr},(err,fromAsset)=>{

          if(err){
            callback(true,"multichain_err");
            return;
          }else{
            multichain.getAddressBalances({address : to.addr},(err,toAsset)=>{

              if(err){
                callback(true,"multichain_err");
              }else{

                let fromBalance;
                for(let index in fromAsset){
                  if(fromAsset[index].name == WeGen_conf.assetname){
                    for(let key in fromAsset[index]){
                      if(key == 'qty'){
                        fromBalance = fromAsset[index][key];
                      }
                    }
                  }
                }

                let toBalance;
                for(let index in toAsset){
                  if(toAsset[index].name == WeGen_conf.assetname){
                    for(let key in toAsset[index]){
                      if(key == 'qty'){
                        toBalance = toAsset[index][key];
                      }
                    }
                  }
                }

                let account = [{
                  from : from.email,
                  to : to.email,
                  input : "",
                  output : amount,
                  description : "Transfer",
                  memo : memo,
                  date : now.toFormat('YYYY-MM-DD HH24:MI:SS'),
                  balance : Number(fromBalance),
                  txType : 'sendAsset'
                },{
                  from : to.email,
                  to : from.email,
                  input : amount,
                  output : "",
                  description : "Transfer",
                  memo : memo,
                  date : now.toFormat('YYYY-MM-DD HH24:MI:SS'),
                  balance : Number(toBalance),
                  txType : 'sendAsset'
                }];

                callback(null,from,to,account);
              }
            });
          }
        });
      },

      function(from,to,account,callback){
        ledger.insertMany(account,(err,result)=>{
          if(err){
            callback(true,"mongodb_err");
            return;
          }else{
            callback(null,"success");
          }
        });
      }

    ],function(err,result){
      if(result == "mongodb_err"){
        let result = {
          "Result" : "Failure",
          "Message" : "시스템 오류1.",
        }
        return res.json(result);
      }else if(result == "mongodb_null1"){
        let result = {
          "Result" : "Failure",
          "Message" : "시스템 오류2-1.",
        }
        return res.json(result);
      }
      else if(result == "mongodb_null2"){
        let result = {
          "Result" : "Failure",
          "Message" : "시스템 오류2-2.",
        }
        return res.json(result);
      }else if(result == "multichain_err"){
        let result = {
          "Result" : "Failure",
          "Message" : "시스템 오류3.",
        }
        return res.json(result);
      }else if(result == "no_balance"){
        let result = {
          "Result" : "Failure",
          "Message" : "잔액 부족.",
        }
        return res.json(result);
      }else if(result == 'permissions_send'){
        let result = {
          "Result" : "Failure",
          "Message" : "권한 없음.",
        }
        return res.json(result);
      }else if(result == 'permissions_receive'){
        let result = {
          "Result" : "Failure",
          "Message" : "권한 없음.",
        }
        return res.json(result);
      }else{
        let result = {
          "Result" : "Success",
          "Message" : "지불거래 성공.",
        }
        return res.json(result);
      }
    });
  });
});

module.exports = router;
