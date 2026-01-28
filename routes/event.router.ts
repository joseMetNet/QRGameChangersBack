    import { Router } from 'express';
    import { getEvents } from '../controllers/event.controller';
    import { createEvent } from '../controllers/event.controller';
    import { updateEvent } from '../controllers/event.controller';
    import { deleteEvent } from '../controllers/event.controller';
    import { getEventById } from '../controllers/event.controller';
    import { uploadEventCover } from './../controllers/event.controller';
    const eventRouter = Router();

    eventRouter.get('/event', getEvents)
    eventRouter.get('/getEvent/:idEvent', getEventById);
    eventRouter.post('/createEvent',createEvent)
    eventRouter.put('/updateEvent/:idEvent',updateEvent)
    eventRouter.delete('/deleteEvent/:idEvent',deleteEvent)
    eventRouter.post("/uploadEventCover/:idEvent", uploadEventCover);

    export default eventRouter;