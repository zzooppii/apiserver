const WeGen_conf = require('../helpers/conf.json')

const multichain = require("multichain-node")({
  port : parseInt(WeGen_conf.multichainport, 10),
  host : WeGen_conf.multichainhost,
  user : 'multichainrpc',
  pass : WeGen_conf.multichainpwd // CUSTOMIZE
});

module.exports = multichain;
