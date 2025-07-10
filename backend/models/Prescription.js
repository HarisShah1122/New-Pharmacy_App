const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Prescription = sequelize.define(
  'prescription',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    erx_no: { type: DataTypes.STRING, allowNull: false },
    erx_date: { type: DataTypes.DATE, allowNull: false },
    prescriber_id: { type: DataTypes.STRING, allowNull: false },
    member_id: { type: DataTypes.STRING, allowNull: false },
    payer_tpa: { type: DataTypes.STRING, allowNull: false },
    emirates_id: { type: DataTypes.STRING, allowNull: false },
    reason_of_unavailability: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    gender: { type: DataTypes.STRING, allowNull: false },
    date_of_birth: { type: DataTypes.DATE, allowNull: false },
    weight: { type: DataTypes.INTEGER, allowNull: false },
    mobile: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    fill_date: { type: DataTypes.DATE, allowNull: false },
    physician: { type: DataTypes.STRING, allowNull: false },
    prescription_date: { type: DataTypes.DATE, allowNull: false },
  },
  { timestamps: true }
);

module.exports = Prescription;