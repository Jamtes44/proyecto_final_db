const bcrypt = require('bcryptjs');

class cipherhandler {
  async createhash(password) {
    const saltrounds = 10;
    const salt = await bcrypt.genSalt(saltrounds);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  }

  async verifyhash(password, storedhash) {
    const match = await bcrypt.compare(password, storedhash);
    return match;
  }
}

module.exports = new cipherhandler();