import { Router } from 'express';
import { getMotivosByIdEvent } from '../controllers/motivo.controller';

const motivoRouter = Router();

motivoRouter.get('/motivos/:idEvent', getMotivosByIdEvent);

export default motivoRouter;