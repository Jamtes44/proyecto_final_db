const express = require('express');
const cors = require('cors');
const path = require('path');
const parkingRoutes = require('./routes/parking.routes');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json()); 

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', parkingRoutes);

app.listen(PORT, () => {
    console.log(`   Park Easy Server running on port ${PORT} `);
    console.log(`   http://localhost:${PORT}               `);
});