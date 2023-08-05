import { DataTypes } from 'sequelize';
import db from '../database/connection';

const Usuario = db.define(
   'Usuario',
   {
      // id: {
      //     type: DataTypes.STRING,
      //     allowNull: true,
      //     primaryKey: true
      // },
      name: {
         type: DataTypes.STRING,
         allowNull: true
      },
      last_name: {
         type: DataTypes.STRING,
         allowNull: true
      },
      phone: {
         type: DataTypes.STRING,
         allowNull: true
      },
      addres: {
         type: DataTypes.STRING,
         allowNull: true
      },
      email: {
         type: DataTypes.STRING,
         allowNull: true
      },
      password: {
         type: DataTypes.STRING,
         allowNull: true
      },
      id_check_in: {
         type: DataTypes.STRING,
         allowNull: true
      },
      createdAt: {
         type: DataTypes.DATE,
         defaultValue: DataTypes.NOW
      },
      updatedAt: {
         type: DataTypes.DATE,
         defaultValue: DataTypes.NOW
      }
   },
   {
      timestamps: true
   }
);

export default Usuario;
