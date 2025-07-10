const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const HealthAuthorityConfig = sequelize.define('HealthAuthorityConfig', {
    health_authority_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    drug_list_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    diagnosis_list_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    clinician_list_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  }, {
    tableName: 'healthAuthorityConfig',
    timestamps: true,
  });
  console.log('HealthAuthorityConfig model defined');
  return HealthAuthorityConfig;
};