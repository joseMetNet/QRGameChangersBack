import { DataTypes, Model } from "sequelize";
import db from "../database/connection";


export class User extends Model {
   public id!: number;
   public identification!: string;
   public name!: string;
   public lastName!: string;
   public email!: string;
   public idRole!: number;
   public idAuth!: string;
}

User.init(
   {
      id: {
         type: DataTypes.INTEGER,
         autoIncrement: true,
         primaryKey: true,
      },
      identification: {
         type: DataTypes.STRING,
         allowNull: false,
      },
      name: {
         type: DataTypes.STRING,
         allowNull: false,
      },
      lastName: {
         type: DataTypes.STRING,
         allowNull: false,
      },
      email: {
         type: DataTypes.STRING,
         allowNull: false,
         unique: true, // evita correos repetidos
      },
      idRole: {
         type: DataTypes.INTEGER,
         defaultValue: 1,
      },
      idAuth: {
         type: DataTypes.STRING,
         allowNull: false,
      },
   },
   {
      sequelize: db,
      tableName: "TB_USER_ME_LOS_TOMO", // 👈 asegúrate que la tabla exista
      timestamps: false,     // si tu tabla no usa createdAt / updatedAt
   }
);
export default User;

