const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PharmacyHACredentials = sequelize.define('PharmacyHACredentials', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  pharmacy_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  ha_code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ha_username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ha_password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
  },
}, {
  tableName: 'pharmacyHACredentials',
  timestamps: true,
});

module.exports = PharmacyHACredentials;