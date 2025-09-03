import { Router } from 'express';
import { getEventLocationByEvent } from '../controllers/eventLocation.controller';
import { createEventLocations } from '../controllers/eventLocation.controller';
import { updateEventLocation } from '../controllers/eventLocation.controller';
import { deleteEventLocation } from '../controllers/eventLocation.controller';

const eventLocationRouter = Router();

eventLocationRouter.get('/eventLocation/:idEvent', getEventLocationByEvent)

eventLocationRouter.post('/eventLocation', createEventLocations);

eventLocationRouter.put("/eventLocation/:idEventLocation", updateEventLocation);
eventLocationRouter.delete("/eventLocation/:idEventLocation", deleteEventLocation);


export default eventLocationRouter;