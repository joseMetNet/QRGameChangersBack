import { DataTypes } from 'sequelize';
import db from '../database/connection';

const CheckIn = db.define(
  'TB_CheckIn',
  {
    idCheckIn: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    document: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    used: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    token: {
      type: DataTypes.STRING(256),
      allowNull: true
    }
  },
  {
    timestamps: false,
    freezeTableName: true
  }
);

export default CheckIn;