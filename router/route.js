const express = require('express');
const router = express.Router();

router.use('/',require('../json/login.js'));
router.use('/',require('../json/trlog.js'));
router.use('/',require('../json/balance.js'));
router.use('/',require('../json/withdrawal.js'));
router.use('/',require('../json/userinfo.js'));
router.use('/',require('../json/updateuserinfo.js'));
router.use('/',require('../json/register.js'));
router.use('/',require('../json/qrcodescan.js'));
router.use('/',require('../json/changepwd.js'));
router.use('/',require('../json/resetpwd.js'));
module.exports = router;
