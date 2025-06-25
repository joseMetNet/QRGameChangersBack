import { DataTypes, Model } from 'sequelize';
import db from '../database/connection';

const Country = db.define('TB_Country', {
    idcountry: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    Country: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'TB_Country',
    timestamps: false,
    freezeTableName: true
});

export default Country;