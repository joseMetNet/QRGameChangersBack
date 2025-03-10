import { DataTypes, Model } from 'sequelize';
import db from '../database/connection';

export class CheckIn extends Model {
  declare idCheckIn: number;
  declare name: string;
  declare description: string;
  declare document: string;
  declare phone: string;
  declare email: string;
  declare used: boolean;
  declare token: string;
}

CheckIn.init(
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
    description: {
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
    sequelize: db,
    modelName: 'TB_CheckIn',
    timestamps: false,
    freezeTableName: true
  }
);