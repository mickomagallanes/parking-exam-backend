var express = require('express');
var router = express.Router();

let Parking = require('../services/parking');
let parking = new Parking();

router.get('/entrypoint/get', async function (req, res, next) {

  let result =  parking.getEntryPoints();

  res.json({ "status": true, "msg": "Successful getting all rows", "data": result });
  
});

router.post('/park', async function (req, res, next) {

  if (req.body.entryPoint < 1 || req.body.entryPoint > 3) {

  res.json({ "status": false, "msg": "Failed, entry point must be 1, 2, or 3" });
  return ;  
  }
  let result =  parking.parkVehicle(req.body.vehicleType, req.body.entryPoint);

  res.json({ "status": true, "msg": "Successful getting all rows", "data": result });
  
});

router.get('/map', async function (req, res, next) {

  let result =  parking.getMap();

  res.json({ "status": true, "msg": "Successful getting all rows", "data": result });
  
});

router.post('/unpark', async function (req, res, next) {

  let result =  parking.unparkVehicle(req.body.row, req.body.col);

  res.json({ "status": true, "msg": "Successful getting all rows", "data": result });
  
});

module.exports = router;
