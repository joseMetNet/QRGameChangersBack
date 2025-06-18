import { DataTypes } from 'sequelize';
import db from '../database/connection';

const Product = db.define(
   'Producto',
   {
      id_check_in: {
         type: DataTypes.STRING,
         allowNull: false
      },
      idEnvent: {
         type: DataTypes.INTEGER,
         allowNull: false
      },
      idEventLocation: {
         type: DataTypes.INTEGER,
         allowNull: false
      },
      name_product: {
         type: DataTypes.STRING,
         allowNull: false
      },
      lot: {
         type: DataTypes.STRING,
         allowNull: false
      },
      offer_code: {
         type: DataTypes.STRING,
         allowNull: false
      },
      lot_price: {
         type: DataTypes.INTEGER,
         allowNull: false
      },
      transactions: {
         type: DataTypes.STRING,
         allowNull: false
      },
      sale_date: {
         type: DataTypes.DATE,
         allowNull: false
      },
      confirmation_date: {
         type: DataTypes.DATE,
         allowNull: false
      },
      purchase_status: {
         type: DataTypes.STRING,
         allowNull: false
      },
      eTicket_blocked: {
         type: DataTypes.STRING,
         allowNull: false
      },
      invitation_type: {
         type: DataTypes.STRING,
         allowNull: false
      },
      buyer_name: {
         type: DataTypes.STRING,
         allowNull: false
      },
      buyer_email: {
         type: DataTypes.STRING,
         allowNull: false
      },
      buyer_document: {
         type: DataTypes.STRING,
         allowNull: false
      },
      buyer_phone: {
         type: DataTypes.STRING,
         allowNull: false
      },
      eTicket: {
         type: DataTypes.STRING,
         allowNull: false
      },
      check_in_status: {
         type: DataTypes.BOOLEAN,
         allowNull: false
      },
      check_in_date: {
         type: DataTypes.DATE,
         allowNull: false
      },
      participant_name: {
         type: DataTypes.STRING,
         allowNull: false
      },
      participant_email: {
         type: DataTypes.STRING,
         allowNull: false
      },
      register_person: {
         type: DataTypes.STRING,
         allowNull: false
      },
      postal_code: {
         type: DataTypes.STRING,
         allowNull: false
      },
      street: {
         type: DataTypes.STRING,
         allowNull: false
      },
      city: {
         type: DataTypes.STRING,
         allowNull: false
      },
      department: {
         type: DataTypes.STRING,
         allowNull: false
      },
      country: {
         type: DataTypes.STRING,
         allowNull: false
      },
      participant_phone: {
         type: DataTypes.STRING,
         allowNull: false
      },
      gender: {
         type: DataTypes.STRING,
         allowNull: false
      },
      birth_date: {
         type: DataTypes.DATE,
         allowNull: false
      },
      participant_phone2: {
         type: DataTypes.STRING,
         allowNull: false
      },
      url_check_in: {
         type: DataTypes.STRING,
         allowNull: false
      },
      upgrade_offer: {
         type: DataTypes.STRING,
         allowNull: false
      },

      createdAt: {
         type: DataTypes.DATE,
         defaultValue: DataTypes.NOW
      },
      updatedAt: {
         type: DataTypes.DATE,
         defaultValue: DataTypes.NOW
      },
      token: {
         type: DataTypes.STRING,
         allowNull: false
      }
   },
   {
      timestamps: false
   }
);

export default Product;

export interface ProductInterface {
   id?: number;
   id_check_in?: null;
   idEnvent?: number;
   idEventLocation?: number;
   name_product?: string;
   lot?: string;
   offer_code?: string;
   lot_price?: number;
   transactions?: string;
   sale_date?: Date;
   confirmation_date?: Date;
   purchase_status?: string;
   eTicket_blocked?: null;
   invitation_type?: string;
   buyer_name?: string;
   buyer_email?: string;
   buyer_document?: null;
   buyer_phone?: null;
   eTicket?: string;
   check_in_status?: boolean;
   check_in_date?: Date;
   participant_name?: string;
   participant_email?: string;
   register_person?: string;
   postal_code?: string;
   street?: string;
   city?: string;
   department?: null;
   country?: string;
   participant_phone?: string;
   gender?: null;
   birth_date?: null;
   participant_phone2?: string;
   url_check_in?: string;
   upgrade_offer?: string;
   createdAt?: null;
   updatedAt?: null;
}
