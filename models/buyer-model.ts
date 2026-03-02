import { DataTypes, Model, Optional } from 'sequelize';
import db from '../database/connection';

interface BuyerAttributes {
  idBuyer: number;
  idTransaction: string;
  idOrder: string;
  reference: string;
  description: string;
  name: string;
  email: string;
  originalValue: string;
  orderStatus: number;
  paymentMethod: string;
  transactionType: string;
  transactionStatus: string;
  responseCode: string;
  totalInstallment: string;
  code: string;
  token: string;
  idEvent?: number;
}

export class Buyer extends Model {
  declare idBuyer: number;
  declare idTransaction: string;
  declare idOrder: string;
  declare createdAt: string;
  declare lastUpdated: string;
  declare reference: string;
  declare description: string;
  declare name: string;
  declare email: string;
  declare originalValue: string;
  declare orderStatus: boolean;
  declare paymentMethod: string;
  declare transactionType: string;
  declare transactionStatus: string;
  declare responseCode: string;
  declare totalInstallment: string;
  declare code: string;
  declare token: string;
  declare idEvent?: number;
}

Buyer.init(
  {
    idBuyer: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    idTransaction: {
      type: DataTypes.STRING(256),
      allowNull: true
    },
    idOrder: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    lastUpdated: {
      type: DataTypes.DATE,
      allowNull: true
    },
    reference: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    description: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    originalValue: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    orderStatus: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    paymentMethod: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    transactionType: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    transactionStatus: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    responseCode: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    totalInstallment: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    code: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    token: {
      type: DataTypes.STRING(256),
      allowNull: true
    },
    idEvent: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  },
  {
    sequelize: db,
    tableName: 'TB_Buyer',
    timestamps: false,
    freezeTableName: true
  }
);