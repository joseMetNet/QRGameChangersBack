import { Router } from 'express';
import { getEventLocationByEvent } from '../controllers/eventLocation.controller';

const eventLocationRouter = Router();

eventLocationRouter.get('/eventLocation/:idEvent', getEventLocationByEvent)

export default eventLocationRouter;