const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const { v4: uuidv4 } = require('uuid');

const MemberAuthorization = sequelize.define("MemberAuthorization", {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    primaryKey: true,
  },
  memberId: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      is: /^TEST-PAYER-\d+$/,
    },
  },
}, {
  tableName: 'member_authorizations',
  timestamps: true,
});

module.exports = MemberAuthorization;