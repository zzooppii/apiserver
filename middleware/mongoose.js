const mongoose = require('mongoose');
const WeGen_conf = require('../helpers/conf.json');

// mongoose.Promise set by leepg to avoid deprecation warning: mpromise is deprecated
mongoose.Promise = global.Promise;

function connectMongo(){
  // useMongoClient:true added by leepg to avoid deprecation warning: 'open()' is deprecated
  mongoose.connect(WeGen_conf.mongodbserver,function(err){
    if(err){
      console.log(err);
    }else{
      console.log('MongoDB connected');
    }
  });
}

module.exports = connectMongo();
