const fdb = require('firebase-admin').firestore();
const db = require('../dao/db.dao'); // Tu conexión a MySQL

class etlprocessor {
  
  async extract() {
    console.log('iniciando extracción (extract)...');
    const snapshot = await fdb.collection('parkinglog').get();
    
    if (snapshot.empty) {
      return [];
    }

    const rawdata = [];
    snapshot.forEach(doc => {
      rawdata.push({ id: doc.id, ...doc.data() });
    });
    
    return rawdata;
  }

  transform(rawdata) {
    console.log('iniciando transformación (transform)...');
    
    return rawdata.map(item => {
      const safeTotalPaid = isNaN(item.totalpaid) ? 0 : parseFloat(item.totalpaid);
      
      const formatdate = (dateval) => {
        if (!dateval) return null;
        
        if (typeof dateval === 'string' && dateval.includes(' ')) {
            return dateval;
        }
        
        if (dateval.toDate && typeof dateval.toDate === 'function') {
            const d = dateval.toDate();
            return d.toISOString().slice(0, 19).replace('T', ' ');
        }
        

        try {
            return new Date(dateval).toISOString().slice(0, 19).replace('T', ' ');
        } catch (e) {
            return null;
        }
      };

      return {
        firebaseId: item.id,
        plate: item.plate ? item.plate.toLowerCase() : 'desconocido',
        vehicletype: item.vehicletype || 'otro',
        entrytime: formatdate(item.entrytime),
        exittime: formatdate(item.exittime),
        totalpaid: safeTotalPaid
      };
    });
  }

  async load(transformeddata) {
    console.log('iniciando carga (load)...');
    let insertcount = 0;

    for (const record of transformeddata) {

      await db.query(
        'INSERT INTO analytic (plate, vehicletype, entrytime, exittime, totalpaid) VALUES (?, ?, ?, ?, ?)',
        [record.plate, record.vehicletype, record.entrytime, record.exittime, record.totalpaid]
      );
      
      // Opcional: Borramos el documento de Firebase para no volver a sincronizarlo
      await fdb.collection('parkinglog').doc(record.firebaseId).delete();
      insertcount++;
    }
    
    return insertcount;
  }

  // Método orquestador que ejecuta el flujo completo
  async runetl() {
    const rawdata = await this.extract();
    if (rawdata.length === 0) return 0; // No hay datos nuevos

    const transformeddata = this.transform(rawdata);
    const count = await this.load(transformeddata);
    
    return count;
  }
}

module.exports = new etlprocessor();