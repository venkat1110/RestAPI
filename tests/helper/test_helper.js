const mongoose = require('mongoose');
const app = require('../../app');

exports.connectTestDB = () => {
  mongoose.Promise = global.Promise;
  mongoose.connect(process.env.DATABASE_TEST);
};

exports.startConnection = () => {
  return app.listen(process.env.PORT_TEST);
};

exports.closeConnection = server => {
  return Promise.all([mongoose.connection.close(), server.close()]);
};
