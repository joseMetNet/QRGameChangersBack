import { DataTypes, Model, Optional } from 'sequelize';
import db from '../database/connection';


interface EventAttributes {
    idEvent: number;
    name: string;
    isActive: boolean;
    description: string;
    eventDate: Date;
    eventTime: string;
    idCity: number;
    organizer: string;
    eventImage: string;
    refundPolicy: string;
}

type EventCreationAttributes = Optional<EventAttributes, 'idEvent'>;



class Event extends Model<EventAttributes, EventCreationAttributes> implements EventAttributes {
    public idEvent!: number;
    public name!: string;
    public isActive!: boolean;
    public description!: string;
    public eventDate!: Date;
    public eventTime!: string;
    public idCity!: number;
    public organizer!: string;
    public eventImage!: string;
    public refundPolicy!: string;
}

Event.init(
    {
        idEvent: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING(500),
            allowNull: false,
            defaultValue: 'No description'
        },
        eventDate: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        eventTime: {
            type: DataTypes.TIME,
            allowNull: false,
            defaultValue: '00:00:00'
        },
        idCity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        organizer: {
            type: DataTypes.STRING(255),
            allowNull: false,
            defaultValue: 'Undefined'
        },
        eventImage: {
            type: DataTypes.STRING(255),
            allowNull: false,
            defaultValue: 'no-image.png'
        },
        refundPolicy: {
            type: DataTypes.STRING(255),
            allowNull: false,
            defaultValue: 'No refund policy'
        }
    },
    {
        sequelize: db,
        modelName: 'TB_Event',
        timestamps: false,
        freezeTableName: true
    }
);





export default Event;
