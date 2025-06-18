import { Router } from 'express';
import { getEvent } from '../controllers/event.controller';

const eventRouter = Router();

eventRouter.get('/event', getEvent)

export default eventRouter;