const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  const DiagnosisList = sequelize.define('DiagnosisList', {
    id: {
      type: DataTypes.CHAR(36),
      defaultValue: () => uuidv4(),
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    code: {
  type: DataTypes.STRING,
  allowNull: false,
  unique: true,
},
    diagnosis_list_id: {
     type: DataTypes.UUID,
      allowNull: true,  
      
    },
    
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'inactive',
      allowNull: false,
    },
  });

  return DiagnosisList;
};
