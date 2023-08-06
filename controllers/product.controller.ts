import { Request, Response } from 'express';
import Product from '../models/productos';
import CheckinModel from '../models/check-in';
import { ProductInterface } from '../models/productos';

import { Op } from 'sequelize';

export const getProducts = async (req: Request, res: Response) => {
   try {
      const products = await Product.findAll();

      if (products.length == 0) {
         return res.status(204).json({
            message: `Lo sentimos, no encontramos resultados`
         });
      }

      return res.status(200).json({
         message: 'getProducts',
         products
      });
   } catch (error) {
      console.log('error: ', error);
      return res.status(500).json({
         message: 'Lo sentimos hubo un error, intente nuevamente o contacte con el administrador'
      });
   }
};

export const getProductByTicket = async (req: Request, res: Response) => {
   try {
      const { eTicket , idUser} = req.body;
      // const { eTicket } = req.params;

      const product: any = await Product.findOne({
         where: {
            eTicket
         }
      });

      if (!product) {
         return res.status(400).json({
            message: `Lo sentimos, este código no existe.`,
            user: null
         });
      }

      const user = {
         //  id: product.id,
         buyer_name: product.buyer_name,
         participant_phone: product.participant_phone,
         register_person: product.register_person,
         name_product: product.name_product
      };
      //   const checks = await CheckinModel.findAll();
      const checkin: any = await CheckinModel.findOne({
         where: {
            // idProduct: product.id
            [Op.and]: [ { idProduct: product.id }, { checkIn: true } ]
         }
      });

      if (checkin) {
         return res.status(400).json({
            message: `El usuario ya ingresó`,
            user
         });
      }

      const postCheckIn = {
         idProduct: product.id,
         idUser: idUser,
         checkIn: true
      };

      const checkCreated = CheckinModel.build(postCheckIn);
      await checkCreated.save();

      return res.status(200).json({
         message: 'Codigó verificado exitosamente',
         product,
         user
      });
   } catch (error) {
      console.log('error: ', error);
      return res.status(500).json({
         message: 'Lo sentimos hubo un error, intente nuevamente o contacte con el administrador'
      });
   }
};
