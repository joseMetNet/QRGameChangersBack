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
// checkinFaceIdRouter.post('/face-recognition', handleFaceRecognition);
// checkinFaceIdRouter.post('/face-recognition', upload.single('image'), handleFaceRecognition);

// const upload = multer(); // almacenamiento en memoria
// const checkinFaceIdRouter = express.Router();

checkinFaceIdRouter.post(
  '/face-recognition',
  upload.single('image'), handleFaceRecognition,// 👈 este middleware es obligatorio
//   async (req, res) => {
//     console.log("data imagen", req.file); // 👈 aquí debería ya imprimirse
//     if (!req.file) {
//       return res.status(400).json({ message: 'Imagen no encontrada en la solicitud' });
//     }

//     // Aquí puedes continuar con la lógica de reconocimiento
//     return res.status(200).json({ message: 'Imagen recibida' });
//   }
);

export default checkinFaceIdRouter;
