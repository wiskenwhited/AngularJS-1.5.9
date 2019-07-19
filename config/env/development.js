module.exports = {

  db: {
    connectionString: process.env.TELECOM_INC || "mysql://127.0.0.1:3306/telecom"
  },

  log: {
    format: 'dev',
    options: {}
  }

};
