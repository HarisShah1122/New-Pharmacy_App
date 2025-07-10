const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HealthAuthority = sequelize.define('HealthAuthority', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  shortName: { type: DataTypes.STRING, allowNull: true, unique: true },
  contact_email: { type: DataTypes.STRING, allowNull: true, unique: true, validate: { isEmail: true } },
  status: { type: DataTypes.ENUM('ACTIVE', 'INACTIVE'), allowNull: false, defaultValue: 'ACTIVE' },
  country: { type: DataTypes.STRING, allowNull: true },
  state: { type: DataTypes.STRING, allowNull: true },
  city: { type: DataTypes.STRING, allowNull: true },
  
}, { 
  timestamps: true, 
  tableName: 'healthAuthorities' 
});

module.exports = HealthAuthority;