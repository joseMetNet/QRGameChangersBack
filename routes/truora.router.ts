// import { Router } from 'express';
import { crearEnrollmentRecognition, crearValidacion, crearValidationRecognition, obtenerAccountsDocs, obtenerEnrollmentFacialRecognitionCreated, obtenerValidationDocs, obtenerValidationFacialRecognition } from '../controllers/truora.controller';
import express from 'express';
import multer from 'multer';
import axios from 'axios';


const router = express.Router();
const upload = multer();


// POSTs existentes
router.post('/truora-validacion', crearValidacion);
router.post('/truora-enrollment', crearEnrollmentRecognition);
router.post('/truora-validation-recognition', crearValidationRecognition);

// ✅ Nuevos GET
router.get('/truora-validation-docs/:validationId', obtenerValidationDocs);
router.get('/truora-validation-facial/:idValidation', obtenerValidationFacialRecognition);
router.get('/truora-accounts-docs/:accountId', obtenerAccountsDocs);
router.get('/truora-enrollment-facial/:enrollmentId', obtenerEnrollmentFacialRecognitionCreated);

router.post('/upload-truora', upload.single('image'), async (req, res) => {
  const { url } = req.body;
  const file = req.file;

  if (!url || !file) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  try {
    // Truora espera un PUT con el archivo como body y sin headers especiales
    const response = await axios.put(url, file.buffer, {
      headers: { 'Content-Type': file.mimetype }
    });
    // res.status(200).send('OK');
    res.status(200).json({ message: 'OK' });
    console.error('Imagen subida a Truora:', response.data);
  } catch (err:any) {
    console.error('Error Truora:', err.response?.data || err.message);
    res.status(500).json({ error: 'Error subiendo imagen a Truora', details: err.message });
  }
});

export default router;