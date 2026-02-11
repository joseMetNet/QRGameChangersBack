import { DataTypes, Model } from 'sequelize';
import db from '../database/connection';

class EventImage extends Model {
    public idEventImage!: number;
    public idEvent!: number;
    public imageUrl!: string;
}

EventImage.init(
    {
        idEventImage: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        idEvent: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        imageUrl: {
            type: DataTypes.STRING(500),
            allowNull: false
        }
    },
    {
        sequelize: db,
        modelName: 'TB_EventImage',
        timestamps: false,
        freezeTableName: true
    }
);

export default EventImage;
