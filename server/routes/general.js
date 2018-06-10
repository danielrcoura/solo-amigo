var express = require('express');
var router = express.Router();

//Current Date
router.get('/current_date', function(req, res) {
  date = new Date();
  return res.status(200).send(date.toLocaleString());
});

//Version
router.get('/current_version', function(req, res) {
  return res.status(200).send(process.env.VERSION);
});

//Maintenance
router.get('/in_maintenance', function(req, res) {
  return res.status(200).send(process.env.MAINTENANCE);
});

//Welcome message
router.get('/message', function(req, res) {
  return res.status(200).send(process.env.MESSAGE);
});


module.exports = router;