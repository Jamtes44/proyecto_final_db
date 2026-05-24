const mysql = require('mysql2/promise');
const config = require('../env/db_config');

const pool = mysql.createPool(config);

module.exports = pool;