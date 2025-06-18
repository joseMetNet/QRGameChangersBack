import { Request, Response } from 'express';
import EventLocation from '../models/eventLocation.model';
import Event from '../models/event-model';

export const getEventLocationByEvent = async (req: Request, res: Response) => {
  try {
    const { idEvent } = req.params;

    if (!idEvent) {
      return res.status(400).json({
        message: 'El parámetro idEvent es requerido',
      });
    }

    const locations = await EventLocation.findAll({
      where: { idEvent: Number(idEvent) },
      attributes: ['idEventLocation', 'idEvent', 'locationName', 'price'],
      include: [
        {
          model: Event,
          attributes: ['name'], 
          as: 'event',
          where: { isActive: true }, 
        },
      ],
    });

    if (locations.length === 0) {
      return res.status(404).json({
        message: 'No se encontraron localidades para el evento especificado',
      });
    }

    return res.status(200).json({
      message: 'Localidades del evento',
      locations,
    });
  } catch (error) {
    console.error('error: ', error);
    return res.status(500).json({
      message: 'Lo sentimos, hubo un error. Intente nuevamente o contacte al administrador.',
    });
  }
};
