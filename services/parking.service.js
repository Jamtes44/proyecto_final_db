const db = require('../dao/db.dao');
const cipherhelper = require('./cipher.helper'); 
const firebaseservice = require('./firebase.service'); 
const etlservice = require('./etl.service');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const [rows] = await db.query(
      'SELECT * FROM user WHERE username = ?',
      [username]
    );

    if (rows.length > 0) {
      const user = rows[0];
   
      const ispasswordvalid = await cipherhelper.verifyhash(password, user.password);

      if (ispasswordvalid) {
        res.json({ success: true, user: user.username });
      } else {
        res.status(401).json({ success: false, error: 'credenciales incorrectas' });
      }
    } else {
      res.status(401).json({ success: false, error: 'credenciales incorrectas' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const registerUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'datos incompletos' });
    }

    const hashedpassword = await cipherhelper.createhash(password);

    await db.query(
      'INSERT INTO user (username, password) VALUES (?, ?)', 
      [username, hashedpassword]
    );
    
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ success: false, error: 'usuario ya existe' });
    } else {
      res.status(500).json({ success: false, error: err.message });
    }
  }
};
const createVehicle = async (req, res) => {
  try {
    const { placa, tipo, marca, modelo, nombre, identificacion } = req.body;
    await db.query(
      'INSERT INTO vehicle (plate, type, brand, model, ownername, ownerid) VALUES (?, ?, ?, ?, ?, ?)', 
      [placa, tipo, marca, modelo, nombre, identificacion]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'la placa ya existe o hay un error en los datos' });
  }
};


const registerEntry = async (req, res) => {
  try {
    const { placa } = req.body; 

    const [vehicle] = await db.query('SELECT * FROM vehicle WHERE plate = ?', [placa]);
    if (vehicle.length === 0) {
      return res.status(400).json({ success: false, error: 'vehículo no registrado en el sistema' });
    }

    await db.query('INSERT INTO record (plate, status) VALUES (?, "active")', [placa]);
    res.json({ success: true, hora: new Date() });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const findVehicleForExit = async (req, res) => {
  try {
    const { placa } = req.body;
    const [rows] = await db.query(
      "SELECT r.*, v.type FROM record r JOIN vehicle v ON r.plate = v.plate WHERE r.plate = ? AND r.status = 'active'",
      [placa]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'no hay parqueos activos para esta placa' });
    }

    const record = rows[0];
    let diffHours = Math.ceil((new Date() - new Date(record.entrytime)) / (1000 * 60 * 60));
    if (diffHours === 0) diffHours = 1; // cobro mínimo de 1 hora
    const rate = record.type === 'carro' ? 2000 : 1000;
    
    res.json({
      success: true,
      vehiculo: {
        id: record.id,
        placa: record.plate,
        horaIngreso: record.entrytime,
        valorEstimado: diffHours * rate
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
const processExit = async (req, res) => {
  try {
    const { recordId, totalPay } = req.body;

    if (!recordId) {
      return res.status(400).json({ success: false, error: 'id de registro no proporcionado' });
    }

    const pagototal = totalPay || 0;
    const fechasalida = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const [vehiclerows] = await db.query(
      `SELECT r.plate, r.entrytime, v.type 
       FROM record r 
       JOIN vehicle v ON r.plate = v.plate 
       WHERE r.id = ?`,
      [recordId]
    );

    if (vehiclerows.length === 0) {
       return res.status(404).json({ success: false, error: 'registro no encontrado en la base de datos' });
    }

    const vdata = vehiclerows[0];

 
    const [updateresult] = await db.query(
      'UPDATE record SET exittime = ?, totalpay = ?, status = "completed" WHERE id = ? AND status = "active"',
      [fechasalida, pagototal, recordId]
    );

    if (updateresult.affectedRows === 0) {
      return res.status(400).json({ success: false, error: 'el parqueo ya fue completado previamente' });
    }

    const analyticlog = {
      plate: vdata.plate,
      vehicletype: vdata.type,
      entrytime: vdata.entrytime,
      exittime: fechasalida,
      totalpaid: pagototal,
      timestamp: new Date().getTime()
    };

    firebaseservice.savelog(analyticlog);

    res.json({ success: true, message: 'salida procesada correctamente' });

  } catch (err) {
    console.error("Error en proceso de salida:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        r.plate AS placa, 
        v.type AS tipo_vehiculo, 
        r.entrytime AS hora_ingreso, 
        r.exittime AS hora_salida, 
        r.totalpay AS valor_pago, 
        r.status AS estado
      FROM record r
      JOIN vehicle v ON r.plate = v.plate
      ORDER BY r.entrytime DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const getSpots = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT v.type, COUNT(*) as ocupados 
      FROM record r 
      JOIN vehicle v ON r.plate = v.plate 
      WHERE r.status = 'active' 
      GROUP BY v.type
    `);
    
    const totales = { carro: 20, moto: 15 };
    
    const respuesta = [
      { 
        tipo_vehiculo: 'carro', 
        total: totales.carro, 
        ocupados: rows.find(r => r.type === 'carro')?.ocupados || 0 
      },
      { 
        tipo_vehiculo: 'moto', 
        total: totales.moto, 
        ocupados: rows.find(r => r.type === 'moto')?.ocupados || 0 
      }
    ];

    res.json(respuesta);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const triggerEtl = async (req, res) => {
  try {
    const recordssynced = await etlservice.runetl();
    res.json({ 
      success: true, 
      message: `proceso etl completado. ${recordssynced} registros sincronizados.` 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  login,
  registerUser,
  createVehicle,
  registerEntry,
  findVehicleForExit,
  processExit,
  getHistory,
  getSpots,
  triggerEtl
};