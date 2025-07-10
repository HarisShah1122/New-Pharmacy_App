const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const DrugList = sequelize.define('DrugList', {
    drug_list_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    code: {
      type: DataTypes.STRING,
      unique: true,
    },
    status: {
      type: DataTypes.STRING,  
      allowNull: false,
      defaultValue: 'active',  
    },
  }, {
    tableName: 'DrugLists',
    timestamps: false ,
    indexes: [
      { unique: true, fields: ['name'] },
      { unique: true, fields: ['code'] },
    ],
  });

  return DrugList;
};