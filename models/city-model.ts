import { DataTypes } from 'sequelize';
import db from '../database/connection';

const City = db.define('TB_City', {
  idCity: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  idDepartment: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  code: {
    type: DataTypes.STRING,
    allowNull: true
  },
  City: {
    type: DataTypes.STRING,
    allowNull: true
  },
  idStatus: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  idStatusCity: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'TB_City',
  timestamps: false,
  freezeTableName: true
});

export default City;
