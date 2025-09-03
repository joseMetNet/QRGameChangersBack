import { DataTypes, Model, Optional } from 'sequelize';
import db from '../database/connection';
import Event from './event-model';

interface EventLocationAttributes {
    idEventLocation: number;
    idEvent: number;
    locationName: string;
    price: number;
    attendees:number;
}

// 👇 Este type hace que idEventLocation sea opcional en la creación
type EventLocationCreationAttributes = Optional<EventLocationAttributes, 'idEventLocation'>;
class EventLocation extends Model<EventLocationAttributes, EventLocationCreationAttributes> implements EventLocationAttributes {
    public idEventLocation!: number;
    public idEvent!: number;
    public locationName!: string;
    public price!: number;
    public attendees!:number;
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
        },
        attendees:{
            type:DataTypes.INTEGER,
            allowNull:false,
            defaultValue:0
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