module.exports = (sequelize, DataTypes) => {
  const PrescriptionDrug = sequelize.define('PrescriptionDrug', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    prescription_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    ndc_drug_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dispensed_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    days_of_supply: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    instructions: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'prescription_drugs',
    timestamps: false,
  });

  return PrescriptionDrug;
};