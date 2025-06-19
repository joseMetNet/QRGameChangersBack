import { Router } from 'express';
import { getDepartments } from '../controllers/department.controller';

const departmentRouter = Router();

departmentRouter.get('/departments', getDepartments);

export default departmentRouter;
