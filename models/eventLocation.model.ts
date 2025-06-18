import { DataTypes, Model } from 'sequelize';
import db from '../database/connection';
import Event from './event-model';

interface EventLocationAttributes {
    idEventLocation: number;
    idEvent: number;
    locationName: string;
    price: number;
}
class EventLocation extends Model<EventLocationAttributes> implements EventLocationAttributes {
    public idEventLocation!: number;
    public idEvent!: number;
    public locationName!: string;
    public price!: number;
}

EventLocation.init(
    {
        idEventLocation: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        idEvent: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        locationName: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        }
    },
    {
        sequelize: db,
        modelName: 'TB_EventLocation',
        timestamps: false,
        freezeTableName: true
    }
);

EventLocation.belongsTo(Event, { foreignKey: 'idEvent',  as: 'event' });

export default EventLocation;