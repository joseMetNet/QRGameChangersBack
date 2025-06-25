import { DataTypes, Model } from 'sequelize';
import db from '../database/connection';

const Motivo = db.define('TB_Motivo', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    motivo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    idEvent: {
        type: DataTypes.INTEGER,
        allowNull: false}
}, {
    tableName: 'TB_Motivo',
    timestamps: false,
    freezeTableName: true
});

export default Motivo;