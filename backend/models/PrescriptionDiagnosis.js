module.exports = (sequelize, DataTypes) => {
  const PrescriptionDiagnosis = sequelize.define('PrescriptionDiagnosis', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    prescription_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    icd_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    tableName: 'prescription_diagnoses',
    timestamps: true,
  });

  return PrescriptionDiagnosis;
};