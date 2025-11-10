import { Request, Response } from 'express';
import Event from '../models/event-model';

export const getEvent = async (req: Request, res: Response) => {
   try {
      const numbers = await Event.findAll({
         attributes: [ 'idEvent', 'name', 'isActive','description','eventDate','eventTime','organizer','eventImage','refundPolicy' ],
      });

      if (numbers.length == 0) {
         return res.status(400).json({
            message: `Lo sentimos, no encontramos resultados`
         });
      }

      return res.status(200).json({
         message: 'numero de emergencia',
         numbers
      });
   } catch (error) {
      console.log('error: ', error);
      return res.status(500).json({
         message: 'Lo sentimos hubo un error, intente nuevamente o contacte con el administrador'
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
         event: newEvent
      });
   } catch (error) {
      console.error('error: ', error);
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
         event
      });
   } catch (error) {
      console.error('error: ', error);
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
      console.error('error: ', error);
      return res.status(500).json({
         message: 'No se pudo eliminar el evento'
      });
   }
};
