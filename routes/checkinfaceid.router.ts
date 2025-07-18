import { Router } from 'express';
import { insertCheckInFaceId } from '../controllers/checkinfacceid.controller';
import multer from 'multer';
// import { generateFaceID } from '../controllers/checkinfacceid.controller';
import { handleFaceRecognition } from '../controllers/checkinfacceid.controller';

const checkinFaceIdRouter = Router();
const parseFormData = multer().none();

// Configurar multer (almacenamiento en memoria)
const storage = multer.memoryStorage();
const upload = multer({ storage });

checkinFaceIdRouter.post('/check-in-faceid', parseFormData, insertCheckInFaceId);
// checkinFaceIdRouter.post('/face-recognition', generateFaceID);
checkinFaceIdRouter.post('/face-recognition', upload.single('image'), handleFaceRecognition);

export default checkinFaceIdRouter;
