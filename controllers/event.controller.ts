import { Request, Response } from 'express';
import Event from '../models/event-model';

export const getEvent = async (req: Request, res: Response) => {
   try {
      const numbers = await Event.findAll({
         attributes: [ 'idEvent', 'name', 'isActive' ],
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