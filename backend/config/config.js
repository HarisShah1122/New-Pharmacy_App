require('dotenv').config();

module.exports = {
  port: process.env.PORT || 8081, 
  db: {
    name: process.env.DB_NAME || 'pharmacy',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'admin12345',
    host: process.env.DB_HOST || 'localhost',
    dialect: process.env.DB_DIALECT || 'mysql',
    port: process.env.DB_PORT || 3306,
  },
};