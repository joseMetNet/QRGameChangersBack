import { Router } from 'express';
import { getEvent } from '../controllers/event.controller';
import { createEvent } from '../controllers/event.controller';
import { updateEvent } from '../controllers/event.controller';
import { deleteEvent } from '../controllers/event.controller';
import { uploadEventImage } from "../controllers/eventImage.controller";

const eventRouter = Router();

eventRouter.get('/event', getEvent)
eventRouter.post('/createEvent',createEvent)
eventRouter.put('/updateEvent/:idEvent',updateEvent)
eventRouter.delete('/deleteEvent/:idEvent',deleteEvent)
eventRouter.post("/uploadEventImage", uploadEventImage);

export default eventRouter;