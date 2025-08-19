const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const { v4: uuidv4 } = require('uuid');

const AuthorizationRequest = sequelize.define("AuthorizationRequest", {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    primaryKey: true,
  },
  request_body: {
    type: DataTypes.JSON,
    allowNull: false,
  },
}, {
  tableName: 'authorization_requests',
  timestamps: true,
});

module.exports = AuthorizationRequest;