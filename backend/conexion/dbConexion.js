const mongoose = require('mongoose');

const dbConexion = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL;
    const conexion = await mongoose.connect(mongoUrl);
    console.log(`MongoDB conectado: ${conexion.connection.host}`);
  } catch (error) {
    console.error(`Error de conexión a MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = dbConexion;
