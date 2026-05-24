const express = require('express');
const router = express.Router();
const parking_service = require('../services/parking.service');

router.post('/login', parking_service.login);
router.post('/register-user', parking_service.registerUser);
router.post('/registrar-vehiculo', parking_service.createVehicle);
router.post('/registrar-ingreso', parking_service.registerEntry);
router.post('/buscar-vehiculo', parking_service.findVehicleForExit);
router.post('/registrar-salida', parking_service.processExit);
router.get('/historial', parking_service.getHistory);
router.get('/cupos', parking_service.getSpots);
router.post('/ejecutar-etl', parking_service.triggerEtl);

module.exports = router;