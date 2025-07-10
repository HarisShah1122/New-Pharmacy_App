const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const { v4: uuidv4 } = require('uuid'); 

const Drug = sequelize.define("Drug", {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(), 
    primaryKey: true,
  },
  ndc_drug_code: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ha_code: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  trade_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  manufacturer: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  local_agent: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  dosage_form: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  package_type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  package_size: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  granular_unit: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  unit_type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  active_ingredients: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  strengths: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  dispensed_quantity: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  days_of_supply: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  instructions: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  drug_list_id: {
    type: DataTypes.UUID, 
    allowNull: true,
  },
}, {
  tableName: 'drugs',
  timestamps: true,
});

module.exports = Drug;