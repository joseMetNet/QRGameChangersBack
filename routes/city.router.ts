import { Router } from 'express';
import { getCitiesByDepartment } from '../controllers/city.controller';


const cityRouter = Router();

cityRouter.get('/cities/by-department/:idDepartment', getCitiesByDepartment);

export default cityRouter;
