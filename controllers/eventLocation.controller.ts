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
      attributes: ['idEventLocation', 'idEvent', 'locationName', 'price','attendees'],
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

/**
 * Crear una o varias localidades para un evento
 */
export const createEventLocations = async (req: Request, res: Response) => {
    try {
        let { idEvent, locations } = req.body;

        // Caso 2: Si mandaron el array directo en el body
        if (!locations && Array.isArray(req.body)) {
            locations = req.body;
        }

        // Caso 1 o 2: si no está en root, tomo de cada objeto
        if (!idEvent && locations?.length > 0) {
            idEvent = locations[0].idEvent;
        }

        if (!idEvent) {
            return res.status(400).json({ error: 'El campo idEvent es obligatorio.' });
        }

        if (!locations || !Array.isArray(locations)) {
            return res.status(400).json({ error: 'El campo locations debe ser un array.' });
        }

        // Inserto en BD
        const createdLocations = await Promise.all(
            locations.map((loc: any) =>
                EventLocation.create({
                    idEvent: idEvent || loc.idEvent, // prioridad root
                    locationName: loc.locationName,
                    price: loc.price,
                    attendees: loc.attendees ?? 0
                })
            )
        );

        res.json({
            message: 'Localidades creadas con éxito',
            locations: createdLocations
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear localidades' });
    }
};



export const updateEventLocation = async (req: Request, res: Response) => {
  try {
    const { idEventLocation } = req.params;
    const { locationName, price, attendees } = req.body;

    if (!idEventLocation) {
      return res.status(400).json({ message: "El idEventLocation es requerido" });
    }

    const location = await EventLocation.findByPk(idEventLocation);

    if (!location) {
      return res.status(404).json({ message: "Localidad no encontrada" });
    }

    // Actualizar solo los campos enviados
    if (locationName !== undefined) location.locationName = locationName;
    if (price !== undefined) location.price = price;
    if (attendees !== undefined) location.attendees = attendees;

    await location.save();

    return res.json({
      message: "Localidad actualizada con éxito",
      location
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al actualizar la localidad" });
  }
};





/**
 * Delete an event location by its ID
 */

export const deleteEventLocation = async (req: Request, res: Response) => {
  try {
    const { idEventLocation } = req.params;

    if (!idEventLocation) {
      return res.status(400).json({ message: "El idEventLocation es requerido" });
    }

    const deleted = await EventLocation.destroy({
      where: { idEventLocation: Number(idEventLocation) }
    });

    if (!deleted) {
      return res.status(404).json({ message: "Localidad no encontrada" });
    }

    return res.json({ message: "Localidad eliminada con éxito" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al eliminar la localidad" });
  }
};