import { DataTypes } from 'sequelize';
import db from '../database/connection';

const EmergencyModel = db.define(
   'Emergency',
   {
      phone: {
         type: DataTypes.INTEGER,
         allowNull: false
      },
      enable: {
         type: DataTypes.BOOLEAN,
         allowNull: false,
         defaultValue: true
      },
      createdAt: {
         type: DataTypes.DATE,
         defaultValue: DataTypes.NOW
      }
   },
   {
      timestamps: false
   }
);

export default EmergencyModel;

