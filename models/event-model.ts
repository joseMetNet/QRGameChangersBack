import { DataTypes, Model } from 'sequelize';
import db from '../database/connection';
import EventLocation from './eventLocation.model';

interface EventAttributes {
    idEvent: number;
    name: string;
    isActive: boolean;
}



class Event extends Model<EventAttributes> implements EventAttributes {
    public idEvent!: number;
    public name!: string;
    public isActive!: boolean;
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
