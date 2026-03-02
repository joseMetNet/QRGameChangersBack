import { DataTypes, Model } from 'sequelize';
import db from '../database/connection';

export class CheckInFaceId extends Model {
  declare idCheckIn: number;
  declare idEvent: number;
  declare idEventLocation: number;
  declare name: string;
  declare description: string;
  declare document: string;
  declare phone: string;
  declare email: string;
  declare used: boolean;
  declare token: string;
  declare faceID: string;
}

CheckInFaceId.init(
  {
    idCheckIn: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    idEvent: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    idEventLocation: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    idSex: {
      type: DataTypes.INTEGER,
      allowNull: false
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
    },
    faceID: {
      type: DataTypes.STRING(256),
      allowNull: true
    }
  },
  {
    sequelize: db,
    modelName: 'TB_CheckInsFaceId',
    timestamps: false,
    freezeTableName: true
  }
);