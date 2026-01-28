import { Request, Response } from 'express';
import Event from '../models/event-model';
import { BlobServiceClient } from "@azure/storage-blob";
import multer from "multer";

const upload = multer({
   storage: multer.memoryStorage(),
});

const AZURE_STORAGE_CONNECTION_STRING_EVENT_IMAGE =
   process.env.AZURE_STORAGE_CONNECTION_STRING_EVENT_IMAGE!;

const containerName = "event-images";

const blobServiceClient =
   BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING_EVENT_IMAGE
   );

const containerClient =
   blobServiceClient.getContainerClient(containerName);


/**
 * Obtener todos los eventos
 */
export const getEvents = async (req: Request, res: Response) => {
   try {
      const events = await Event.findAll({
         attributes: [
            'idEvent',
            'name',
            'isActive',
            'description',
            'eventDate',
            'eventTime',
            'organizer',
            'eventImage',
            'refundPolicy'
         ],
      });

      if (events.length === 0) {
         return res.status(404).json({
            message: 'No se encontraron eventos'
         });
      }

      return res.status(200).json({
         message: 'Eventos obtenidos con éxito',
         data: events
      });
   } catch (error) {
      console.error('Error en getEvent:', error);
      return res.status(500).json({
         message: 'Error al obtener los eventos'
      });
   }
};

/**
 * Obtener un evento por ID
 */
export const getEventById = async (req: Request, res: Response) => {
   try {
      const { idEvent } = req.params;

      const event = await Event.findByPk(idEvent, {
         attributes: [
            'idEvent',
            'name',
            'isActive',
            'description',
            'eventDate',
            'eventTime',
            'organizer',
            'eventImage',
            'refundPolicy'
         ]
      });

      if (!event) {
         return res.status(404).json({
            message: 'Evento no encontrado'
         });
      }

      return res.status(200).json({
         message: 'Evento encontrado con éxito',
         data: event
      });
   } catch (error) {
      console.error('Error en getEventById:', error);
      return res.status(500).json({
         message: 'No se pudo obtener el evento'
      });
   }
};

/**
 * Crear un evento
 */
export const createEvent = async (req: Request, res: Response) => {
   try {
      const { name, isActive, description, eventDate, eventTime, organizer, eventImage, refundPolicy } = req.body;

      const newEvent = await Event.create({
         name,
         isActive,
         description,
         eventDate,
         eventTime,
         organizer,
         eventImage,
         refundPolicy,
      });

      return res.status(201).json({
         message: 'Evento creado con éxito',
         data: newEvent
      });
   } catch (error) {
      console.error('Error en createEvent:', error);
      return res.status(500).json({
         message: 'No se pudo crear el evento'
      });
   }
};

/**
 * Actualizar un evento
 */
export const updateEvent = async (req: Request, res: Response) => {
   try {
      const { idEvent } = req.params;
      const { name, isActive, description, eventDate, eventTime, organizer, eventImage, refundPolicy } = req.body;

      const event = await Event.findByPk(idEvent);

      if (!event) {
         return res.status(404).json({
            message: 'Evento no encontrado'
         });
      }

      await event.update({
         name,
         isActive,
         description,
         eventDate,
         eventTime,
         organizer,
         eventImage,
         refundPolicy,
      });

      return res.status(200).json({
         message: 'Evento actualizado con éxito',
         data: event
      });
   } catch (error) {
      console.error('Error en updateEvent:', error);
      return res.status(500).json({
         message: 'No se pudo actualizar el evento'
      });
   }
};

/**
 * Eliminar un evento
 */
export const deleteEvent = async (req: Request, res: Response) => {
   try {
      const { idEvent } = req.params;

      const event = await Event.findByPk(idEvent);

      if (!event) {
         return res.status(404).json({
            message: 'Evento no encontrado'
         });
      }

      await event.destroy();

      return res.status(200).json({
         message: 'Evento eliminado con éxito'
      });
   } catch (error) {
      console.error('Error en deleteEvent:', error);
      return res.status(500).json({
         message: 'No se pudo eliminar el evento'
      });
   }
};
/**
 * Subir / actualizar imagen de portada del evento
 */
export const uploadEventCover = [
   upload.single("image"),
   async (req: Request, res: Response) => {
      try {
         const { idEvent } = req.params;
         const file = req.file;

         if (!file) {
            return res.status(400).json({
               message: "No se envió ninguna imagen",
            });
         }

         const event = await Event.findByPk(idEvent);

         if (!event) {
            return res.status(404).json({
               message: "Evento no encontrado",
            });
         }

         const fileName = `cover-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2)}-${file.originalname}`;

         const blockBlobClient =
            containerClient.getBlockBlobClient(fileName);

         await blockBlobClient.uploadData(file.buffer, {
            blobHTTPHeaders: {
               blobContentType: file.mimetype,
            },
         });

         // Guardar URL en la columna eventImage
         event.eventImage = blockBlobClient.url;
         await event.save();

         return res.status(200).json({
            message: "Imagen de portada actualizada con éxito",
            eventImage: event.eventImage,
         });

      } catch (error) {
         console.error("Error en uploadEventCover:", error);
         return res.status(500).json({
            message: "Error al subir la imagen de portada",
         });
      }
   },
];

