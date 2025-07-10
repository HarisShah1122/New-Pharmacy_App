const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Prescription = sequelize.define("Prescription", {
  erxRef: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  createdOn: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  memberId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dob: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  gender: {
    type: DataTypes.ENUM("Male", "Female", "Other"),
    allowNull: false,
  },
});

const Diagnosis = sequelize.define("Diagnosis", {
  code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

const Drug = sequelize.define("Drug", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dosage: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  frequency: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Prescription.hasMany(Diagnosis, { as: "diagnoses", foreignKey: "prescriptionId", onDelete: "CASCADE" });
Diagnosis.belongsTo(Prescription, { foreignKey: "prescriptionId" });

Prescription.hasMany(Drug, { as: "drugs", foreignKey: "prescriptionId", onDelete: "CASCADE" });
Drug.belongsTo(Prescription, { foreignKey: "prescriptionId" });

module.exports = { Prescription, Diagnosis, Drug };
