import Event from './event-model';
import EventImage from './eventImage-model';

// Un evento tiene muchas imágenes
Event.hasMany(EventImage, {
    foreignKey: 'idEvent',
});

// Una imagen pertenece a un evento
EventImage.belongsTo(Event, {
    foreignKey: 'idEvent',
});

export{
    Event, EventImage
}