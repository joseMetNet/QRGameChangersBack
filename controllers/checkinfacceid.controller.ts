import { Request, Response } from 'express';
import crypto from 'crypto';
import { CheckIn } from '../models/checkin-face-id-test';
import { v4 as uuidv4 } from 'uuid';

// export const generateFaceID = (req: Request, res: Response) => {
//   try {
//     const { image } = req.body;

//     if (!image) {
//       return res.status(400).json({ message: 'La imagen es requerida' });
//     }

//     // Aquí podrías guardar la imagen si lo necesitas
//     // const base64Data = image.replace(/^data:image\/png;base64,/, '');
//     // fs.writeFileSync('ruta/deseada/imagen.png', base64Data, 'base64');

//     // Generar UUID
//     const faceID = uuidv4();

//     // Retornar solo el UUID
//     return res.status(200).json({ faceID });
//   } catch (error) {
//     console.error('Error generando FaceID:', error);
//     return res.status(500).json({ message: 'Error interno del servidor' });
//   }
// };


export const handleFaceRecognition = (req: Request, res: Response) => {
  try {
    // Verifica si se envió el archivo
    if (!req.file) {
      return res.status(400).json({ message: 'No se recibió ninguna imagen.' });
    }

    // Aquí podrías guardar la imagen si lo necesitas (req.file.buffer)
    // Por ahora, solo generamos un UUID y lo retornamos

    const faceID = uuidv4();
    return res.status(200).json({ faceID });
  } catch (error) {
    console.error('Error en reconocimiento facial:', error);
    return res.status(500).json({ message: 'Error en el servidor.' });
  }
};

export const insertCheckInFaceId = async (req: Request, res: Response) => {
  try {
    const { idEvent, idEventLocation, name, document, phone, email, description, faceID } = req.body;
    if (!idEvent || !name || !document || !phone || !email || !faceID) {
      return res.status(400).json({
        message: 'Por favor complete todos los campos requeridos'
      });
    }

    // Verificar si ya existe un check-in con ese faceID
    const existingCheckIn = await CheckIn.findOne({ where: { faceID } });
    if (existingCheckIn) {
      return res.status(400).json({
        message: 'El registro de FaceID ya existe o fue utilizado'
      });
    }

    const token = crypto.randomUUID();

    const checkin = CheckIn.build({
      idEvent,
      idEventLocation,
      name,
      document,
      phone,
      email,
      description,
      used: false,
      token,
      faceID
    });

    await checkin.save();

    return res.status(200).json({
      checkin
    });
  } catch (error) {
    console.log('error: ', error);
    return res.status(500).json({
      message: 'Lo sentimos hubo un error, intente nuevamente o contacte con el administrador'
    });
  }
};