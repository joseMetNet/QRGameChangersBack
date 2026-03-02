import { DataTypes } from 'sequelize';
import db from '../database/connection';

const CheckinModel = db.define(
   'CheckIn',
   {
    //   id: {
    //      type: DataTypes.INTEGER,
    //      allowNull: false,
    //      primaryKey: true
    //   },
      idProduct: {
         type: DataTypes.INTEGER,
         allowNull: false
      },
      idUser: {
         type: DataTypes.INTEGER,
         allowNull: false
      },
      checkIn: {
         type: DataTypes.BOOLEAN,
         allowNull: false
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

export default CheckinModel;
// export default Check_in;
