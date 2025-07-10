const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Diagnosis = sequelize.define("Diagnosis", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  icd_code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: "diagnosis_list_icd",
  },
  diagnosis_code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: "diagnosis_list_code",
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  is_primary: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  diagnosis_list_id: {
    type: DataTypes.UUID,
    allowNull: true,
    // references: {
    //   model: "DiagnosisLists",
    //   key: "id",
    // },
  },
}, 
// {
//   timestamps: true,
//   // indexes: [
//   //   {
//   //     unique: true,
//   //     name: "diagnosis_list_icd",
//   //     fields: ["icd_code", "diagnosis_list_id"],
//   //   },
//   //   {
//   //     unique: true,
//   //     name: "diagnosis_list_code",
//   //     fields: ["diagnosis_code", "diagnosis_list_id"],
//   //   },
//   // ],
// }
);

module.exports = Diagnosis;