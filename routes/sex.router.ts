import { Router } from 'express';
import { getSexes } from '../controllers/sex.controller';

const sexRouter = Router();

sexRouter.get('/sex', getSexes)

export default sexRouter;