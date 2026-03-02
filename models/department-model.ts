import { DataTypes } from 'sequelize';
import db from '../database/connection';

const Department = db.define('TB_Department', {
  idDepartment: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  nameDepartment: {
    type: DataTypes.STRING,
    allowNull: false
  },
  code: {
    type: DataTypes.STRING,
    allowNull: true
  },
  idCountry: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  idStatusDepartment: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'TB_Department',
  timestamps: false,
  freezeTableName: true
});

export default Department;
