const express = require('express');
const app = express();
const mongo = require('./middleware/mongoose.js');
const multichain = require('./middleware/multichain-conn.js')

const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

app.set('views',__dirname+'/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({extended : true}));

app.use(require('./router/route.js'));

app.listen(3000,()=>{
  console.log("server runngin on 3150");
})
