import { DataTypes } from 'sequelize';
import db from '../database/connection';
import { Buyer } from './buyer-model';

const Product = db.define('productos', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  id_check_in: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  idEvent: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  idEventLocation: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  name_product: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lot: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  offer_code: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lot_price: {
    type: DataTypes.DECIMAL,
    allowNull: true,
  },
  transactions: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  sale_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  confirmation_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  purchase_status: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  eTicket_blocked: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  invitation_type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  buyer_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  buyer_email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  buyer_document: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  buyer_phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  eTicket: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  check_in_status: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    get() {
      const raw = this.getDataValue('check_in_status');
      return raw === 1;
    },
    set(value: boolean) {
      this.setDataValue('check_in_status', value ? 1 : 0);
    },
  },
  check_in_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  participant_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  participant_email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  register_person: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  postal_code: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  street: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  department: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  participant_phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  birth_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  participant_phone2: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  url_check_in: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  upgrade_offer: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  token: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  idBuyer: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'productos',
  timestamps: false,
  freezeTableName: true,
});

Buyer.hasMany(Product, { foreignKey: 'idBuyer' });
Product.belongsTo(Buyer, { foreignKey: 'idBuyer' });

export default Product;
