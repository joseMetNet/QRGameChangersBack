import { DataTypes } from "sequelize";
import db from "../database/connection";

const Product = db.define('Product', {
    id_check_in: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
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
    transaction: {
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
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    updatedAt: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
});

export default Product;