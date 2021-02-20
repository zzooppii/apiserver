const express = require('express');
const generator = require('generate-password');
const router = express.Router();

const userInfo = require('../models/users.js');
const nodemailer = require('nodemailer'); // added by leepg
const sysInfo = require('../models/systeminfo.js');

const WeGen_conf = require('../helpers/conf.json');

var smtpTransport = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user:"forelinkg@gmail.com",
      pass:"forelink10!"
    }
});
var emailSender = WeGen_conf.emailSender;
var noreplyTail = '<i>* 이 메일주소는 발신전용 주소입니다. 회신이 불가능합니다.</i>';
var notifyViaEmail = true;

let pwdURL = WeGen_conf.pwdURL;

router.post('/resetpwd',(req,res)=>{
  req.on('data', (data) => {
    try {
      inputData = JSON.parse(data);
    } catch (e) {
      console.log(e);
    } finally {

    }
  });
  req.on('end',()=>{
    const email = inputData.UserId;

    userInfo.findOne({'email' : email},(userErr,user)=>{
      if(userErr){
        throw userErr;
      }

      if(!user || user.email !== email || user.isAdmin){ // added by leepg // searching admin's passwd is impossible
        //가입자가 없음
        let jsonRes ={
          'Result' : 'Failure',
          'Message' : '등록되지 않은 이메일입니다.'
        }
        return res.json(jsonRes);
      }else{ // added by leepg
        // reset passswd because current passwd is encrypted
        let resetPasswd = generator.generate({ length: 10, numbers: true });

        sysInfo.find({}).sort({effectDate:-1}).exec((err,result)=>{
          let now = new Date();

          let nowDate =  now.toFormat('YYYY-MM-DD HH24:MI');

          let info;

          for(let i in result){
            if(nowDate > result[i].effectDate){
              info = result[i];
              break;
            }
          }

          if(typeof(info) == "undefined"){
            info = result[0];
          }

          sysInfo.find({effectDate:info.effectDate}).sort({updateTime:-1}).limit(1).exec((err,result)=>{
            if(err){
              throw err;
            }else{
              if(result==null){

              }else{
                let deskemail = result[0].deskemail

                userInfo.update({'email' : email},{
                  pwd : user.generateHash(resetPasswd)
                },(pwdErr,pwdResult)=>{
                  if(pwdErr){
                    throw pwdErr;
                  }
                  if(!notifyViaEmail){
                    //비밀번호 초기화 성공
  	                console.log("ressetPWD done");
                    let jsonRes = {
                      'Result' : 'Success',
                      'Message' : '이메일이 발송되었습니다. 확인하여 주세요.'
                    }
                    return res.json(jsonRes);
                  }else{
                    var mailOptions = { // todo: construct more friendly email
                      from : emailSender,
                      to : user.name + '<' + email + '>',
                      subject : 'WeGen \'비밀번호 찾기\' 결과입니다',
                      html : '요청하신 <b>' + user.name + '</b>(' + email + ')님의 비밀번호를 \'' +
                             '<span style="color:blue"><b>' + resetPasswd + '</b></span>\'로 초기화했습니다.<br>' +
                             '<a href='+ pwdURL +'>로그인 하러 가기.</a><br>' +
                             '<br>' +
                             '<i>* 이 메일주소는 발신전용 주소입니다. 회신이 불가능합니다</i><br>'+'기타 문의사항은 Help desk로 문의해주세요.->'+deskemail,
                      text : '요청하신 ' + user.name + '(' + email + ')님의 비밀번호를 ' + resetPasswd + '로 초기화했습니다.\n' +
                             'WeGen 사이트에서 재로그인하시기 바랍니다.'
                    };
                    smtpTransport.sendMail(mailOptions, function(emailErr, emailRes){
                      if(emailErr){
                        console.log('Email System error')
                      }
                    });
                    console.log("ressetPWD done");
                    let jsonRes = {
                      'Result' : 'Success',
                      'Message' : '이메일이 발송되었습니다. 확인하여 주세요.'
                    }
                    return res.json(jsonRes);
                  }
                });
              }
            }
          });
        });
      }
    });
  })

});

module.exports = router;
