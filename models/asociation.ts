import Event from './event-model';
import EventImage from './eventImage-model';
import City from './city-model';

// Un evento tiene muchas imágenes
Event.hasMany(EventImage, {
    foreignKey: 'idEvent',
});

// Una imagen pertenece a un evento
EventImage.belongsTo(Event, {
    foreignKey: 'idEvent',
});

// 👇 ESTO DEBE EJECUTARSE DIRECTO
Event.belongsTo(City, {
    foreignKey: 'idCity',
});

City.hasMany(Event, {
    foreignKey: 'idCity',
});

export {
    Event, EventImage, City
}