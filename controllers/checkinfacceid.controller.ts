import { Request, Response } from 'express';
import crypto from 'crypto';
import { CheckInFaceId } from '../models/checkin-face-id-test';
import { v4 as uuidv4 } from 'uuid';
import { BlobServiceClient } from '@azure/storage-blob';
import * as dotenv from 'dotenv';
dotenv.config();
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


// export const handleFaceRecognition = (req: Request, res: Response) => {
//   try {
//     // Verifica si se envió el archivo
//     if (!req.file) {
//       return res.status(400).json({ message: 'No se recibió ninguna imagen.' });
//     }

//     // Aquí podrías guardar la imagen si lo necesitas (req.file.buffer)
//     // Por ahora, solo generamos un UUID y lo retornamos

//     const faceID = uuidv4();
//     return res.status(200).json({ faceID });
//   } catch (error) {
//     console.error('Error en reconocimiento facial:', error);
//     return res.status(500).json({ message: 'Error en el servidor.' });
//   }
// };

/**
 * @funtion crea la imagen y la sube al azure para retornar la url publica de la imagen que recibe del front en baase 64
 */

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING!;
const CONTAINER_NAME = 'fac';

export const handleFaceRecognition = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    console.log("data imagen", file);

    if (!file) {
      return res.status(400).json({ message: 'Imagen no encontrada en la solicitud' });
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

    // await containerClient.createIfNotExists({ access: 'container' }); //el contenedor se crea si no existe
    // Crear contenedor si no existe
    await containerClient.createIfNotExists();
    // Establecer acceso público explícitamente
    await containerClient.setAccessPolicy('container');
    

    const blobName = `${Date.now()}-${file.originalname}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // ⬇️ Aquí se asegura el tipo de contenido para que se muestre en el navegador
    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: {
        blobContentType: file.mimetype  // 👈 Tipo MIME correcto (ej. image/png, image/jpeg)
      }
    });

    const imageUrl = blockBlobClient.url;

    return res.status(200).json({
      message: 'Imagen subida correctamente',
      faceURL: imageUrl  // Esta URL se puede abrir directamente en el navegador
    });

  } catch (error) {
    console.error('Error al subir imagen a Azure:', error);
    return res.status(500).json({ message: 'Error al subir imagen a Azure', error });
  }
};

export const insertCheckInFaceId = async (req: Request, res: Response) => {
  try {
    const { idEvent, idEventLocation, idSex, name, document, phone, email, description, faceID } = req.body;
    if (!idEvent || !name || !document || !phone || !email || !faceID) {
      return res.status(400).json({
        message: 'Por favor complete todos los campos requeridos'
      });
    }

    // Verificar si ya existe un check-in con ese faceID
    // const existingCheckIn = await CheckInFaceId.findOne({ where: { faceID } });
    // if (existingCheckIn) {
    //   return res.status(400).json({
    //     message: 'El registro de FaceID ya existe o fue utilizado'
    //   });
    // }

    const token = crypto.randomUUID();

    const checkin = CheckInFaceId.build({
      idEvent,
      idEventLocation,
      idSex,
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