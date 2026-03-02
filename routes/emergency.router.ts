import { Router } from 'express';
import { getEmergencyPhone, createEmergencyNumber, updateEmergencyNumber } from '../controllers/emergency.controller';

const emergencyRouter = Router();

emergencyRouter.get('/emergency', getEmergencyPhone);
emergencyRouter.post('/emergency', createEmergencyNumber);
emergencyRouter.put('/emergency', updateEmergencyNumber);

export default emergencyRouter;
