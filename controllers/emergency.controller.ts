import { Request, Response } from 'express';
import { Op } from 'sequelize';
import EmergencyModel from '../models/emegency-model';

export const getEmergencyPhone = async (req: Request, res: Response) => {
   try {
      const numbers = await EmergencyModel.findAll({
         attributes: [ 'id', 'phone' ]
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

export const createEmergencyNumber = async (req: Request, res: Response) => {
   try {
      const body = req.body;

      const emergency = EmergencyModel.build(body);
      await emergency.save();

      return res.status(200).json({
         message: 'Número de emergencia creado exitosamente',
         emergency
      });
   } catch (error) {
      console.log('error: ', error);
      return res.status(500).json({
         message: 'Lo sentimos hubo un error, intente nuevamente o contacte con el administrador'
      });
   }
};

export const updateEmergencyNumber = async (req: Request, res: Response) => {
   try {
      const { body } = req;

      const emergecyExist: any = await EmergencyModel.findByPk(body.id);

      if (!emergecyExist) {
         return res.status(400).json({
            message: `no s eencontró el numero de emergencia`
         });
      }
      //   const emergecyExist: any = await EmergencyModel.findOne({
      //      where: {
      //         phone: body.phone
      //      }
      //   });

      await emergecyExist.update(body);

      return res.status(200).json({
         message: 'Número de emergencia actualizado exitosamente',
         emergecyExist
      });
   } catch (error) {
      console.log('error: ', error);
      return res.status(500).json({
         message: 'Lo sentimos hubo un error, intente nuevamente o contacte con el administrador'
      });
   }
};
