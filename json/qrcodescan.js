const express = require('express');
const router = express.Router();

const userInfo = require('../models/users.js');
const sysInfo = require('../models/systeminfo.js');
const genuine = require('../models/GenuineProduct.js');
const ledger = require('../models/ledger.js');

const multichain = require('../middleware/multichain-conn.js');
const WeGen_conf = require('../helpers/conf.json');

let result = {
  Result : '',
  Message : ''
}

//error msg
//1.이미 인증된 코드입니다.
//2.QR코드가 등록되지 않았습니다.
//3.등록된 ID가 아닙니다.

router.post('/qrcodescan',(req,res)=>{
  req.on('data', (data) => {
    try {
      inputData = JSON.parse(data);
    } catch (e) {
      console.log(e);
    } finally {

    }
  });

  req.on('end',()=>{

    inputData.Qrcode;
    inputData.Time;
    inputData.PhoneNo;
    inputData.UserId;

    userInfo.findOne({email:inputData.UserId},(err,user)=>{
      if(err){
        throw err;
      }else{
        if(!user){
          result.Result = "Failure";
          result.Message = "등록된 ID가 아닙니다.";
          return res.json(result);
        }else{
          console.log(inputData.Qrcode)
          genuine.findOne({QRCode : inputData.Qrcode},(err,gResult)=>{
            if(err){
              throw err;
            }else{
              if(!gResult){
                result.Result = "Failure";
                result.Message = "QR코드가 등록되지 않았습니다."
                return res.json(result);
              }else{
                if(gResult.scan == true){
                  result.Result = "Failure";
                  result.Message = "이미 인증된 코드입니다."
                  return res.json(result);
                }else{
                  sysInfo.find().sort({effectDate:-1}).exec((err,sysResult)=>{
                    let info = auth.getEffectDate(sysResult);
                    sysInfo.find({effectDate:info.effectDate}).sort({updateTime:-1}).limit(1).exec((err,qrqty)=>{
                     let qrqty = qrqty[0].deskemail
                      multichain.issueMoreFrom({
                        from : WeGen_conf.multichainAdminAddress,
                        to : user.addr,
                        asset : WeGen_conf.assetname,
                        qty : 1
                      },(err,data)=>{
                        if(err){
                          throw err;
                        }else{
                          multichain.getAddressBalances({address : user.addr},(err,asset)=>{
                            if(err){
                              throw err;
                            }else{
                              let balance;
                              for(let index in asset){
                                if(asset[index].name == WeGen_conf.assetname){
                                  for(let key in asset[index]){
                                    if(key == 'qty'){
                                      balance = asset[index][key];
                                    }
                                  }
                                }
                              }

                              let now = new Date();

                              let account = [{
                                from : user.email,
                                to : "Genuine",
                                input : 1,
                                output : "",
                                description : 'Genuine',
                                memo : '상품명.Dior',
                                date : now.toFormat('YYYY-MM-DD HH24:MI:SS'),
                                balance : Number(balance),
                                txType : 'issue'
                              },{
                                from : "Genuine",
                                to : user.email,
                                input : "",
                                output : 1,
                                description : 'Genuine',
                                memo : '상품명.Dior',
                                date : now.toFormat('YYYY-MM-DD HH24:MI:SS'),
                                balance : "",
                                txType : 'issue'
                              }];

                              ledger.insertMany(account,(err,ledgerResult)=>{
                                if(err){
                                  throw err;
                                }else{
                                  genuine.update({QRCode : inputData.Qrcode},{$set:{scan:true}},(err,updateResult)=>{
                                    if(err){
                                      throw err;
                                    }else{
                                      result.Result = "Success";
                                      result.Message = "정품 인증 성공."
                                      return res.json(result);
                                    }
                                  })
                                }
                              })
                            }
                          });
                        }
                      })
                    });    //여기가 sysInfo db 불러오는데
                  });
                }
              }
            }
          });
        }
      }
    })
  })
})

module.exports = router;
