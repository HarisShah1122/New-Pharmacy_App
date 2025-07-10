const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payer = sequelize.define('Payer', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  payer_name: { type: DataTypes.STRING, allowNull: false, unique: true },
  contact_info: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'active' },
});

module.exports = Payer;