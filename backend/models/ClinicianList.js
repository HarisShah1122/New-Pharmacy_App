const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ClinicianList = sequelize.define('ClinicianList', {
    id: { type: DataTypes.STRING, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    code: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.ENUM('ACTIVE', 'INACTIVE'), allowNull: true, defaultValue: 'ACTIVE' },
    clinician_list_id: { type: DataTypes.STRING, allowNull: true },
  }, {
    tableName: 'ClinicianLists',
    timestamps: true,
  });
  return ClinicianList;
};
