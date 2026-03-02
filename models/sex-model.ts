import { DataTypes, Model } from 'sequelize';
import db from '../database/connection';

const Sex = db.define('TB_Sex', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    sex: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'TB_Sex',
    timestamps: false,
    freezeTableName: true
});

export default Sex;