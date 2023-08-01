import { DataTypes } from "sequelize";
import db from "../database/connection";

const Check_in = db.define('Check_in', {
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    },
    id_product: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    },
    id_user: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    },
    check_in: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        primaryKey: true
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
        primaryKey: true
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

export default Check_in;