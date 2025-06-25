import { DataTypes } from "sequelize";
import db from "../database/connection";

const Order = db.define(
  "TB_Order",
  {
    idOrder: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombres: {
      type: DataTypes.STRING,
      allowNull: true 
    },
    apellidos: {
      type: DataTypes.STRING, 
      allowNull: true 
    },
    telefono: {
      type: DataTypes.STRING, 
      allowNull: true 
    },
    email: { 
      type: DataTypes.STRING,
      allowNull: true
    },
    cedula: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },
    direccion: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },
    idCity: { 
      type: DataTypes.INTEGER, 
      allowNull: true 
    },
    idDepartment: { 
      type: DataTypes.INTEGER, 
      allowNull: true 
    },
    total: { 
      type: DataTypes.DECIMAL(18, 2), 
      allowNull: true 
    },
    createAt: { 
      type: DataTypes.DATE, 
      allowNull: true 
    },

    // Nuevos campos opcionales
    fechaHora: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },
    idMotivo: { 
      type: DataTypes.INTEGER, 
      allowNull: true 
    },
    observacionesSalud: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },
    comentarios: { 
      type: DataTypes.TEXT, 
      allowNull: true 
    },
    fechaCumpleanos: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },
    idCountry: { 
      type: DataTypes.INTEGER, 
      allowNull: true 
    },
    edad: { 
      type: DataTypes.INTEGER, 
      allowNull: true 
    },
    idSexo: { 
      type: DataTypes.INTEGER, 
      allowNull: true 
    },
  },
  {
    tableName: "TB_Order",
    timestamps: false,
    freezeTableName: true,
  }
);
export default Order;
