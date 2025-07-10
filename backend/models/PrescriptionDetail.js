const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PrescriptionDetail = sequelize.define('PrescriptionDetail', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    insuredMember: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    validatedBy: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    memberId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    payerTpa: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    emiratesId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    reasonOfUnavailability: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    weight: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    physician: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mobile: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    fillDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  }, {
    tableName: 'prescription_details',
    timestamps: true,
  });

  return PrescriptionDetail;
};