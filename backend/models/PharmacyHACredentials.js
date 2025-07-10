
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PharmacyHACredentials = sequelize.define('PharmacyHACredentials', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  pharmacy_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ha_code: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ha_username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ha_password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  }
}, {
  tableName: 'pharmacyHACredentials',
  timestamps: true
});

module.exports = PharmacyHACredentials;
