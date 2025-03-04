import { Request, Response } from 'express';
import Product from '../models/productos';
import CheckinModel from '../models/check-in';
import { ProductInterface } from '../models/productos';

import { Op, UUID } from 'sequelize';
import db from '../database/connection';
import CheckIn from "../models/checkin-model";
import { Buyer } from "../models/buyer-model";

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
      const { eTicket, idUser } = req.body;
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
            [Op.and]: [{ idProduct: product.id }, { checkIn: true }]
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

export const insertBuyer = async (req: Request, res: Response) => {
   const transaction = await db.transaction();
   try {
      const request: BuyerRequest[] = Array.isArray(req.body) ? req.body : [];

      if (request.length === 0) {
         console.log('No data to insert');
         return res.status(400).json({
            message: 'No hay datos para insertar'
         });
      }

      const newBuyers = [];
      for (const buyer of request) {
         const buyerExist = await Buyer.findOne({
            where: {
               idTransaction: buyer.idTransaction
            },
            transaction
         });
         if (!buyerExist) {
            newBuyers.push({
               ...buyer,
               orderStatus: 0
            });
         }
      }

      if (newBuyers.length === 0) {
         console.log('No new buyers to insert');
         return res.status(400).json({
            message: 'No hay nuevos compradores para insertar'
         });
      }

      if (newBuyers.length > 0) {
         console.log('Inserting new buyers:', newBuyers);
         await Buyer.bulkCreate(newBuyers, { transaction });

         for (const buyer of newBuyers) {
            //const emailBody = await sendVerificationEmail(buyer.idTransaction, buyer.email);
            //console.log("Email has been sent to:", buyer.email);
            //if (!emailBody) {
            //   await transaction.rollback();
            //   return res.status(500).json({
            //      message: 'Lo sentimos hubo un error, intente nuevamente o contacte con el administrador'
            //   });
            //}
         }
      }

      await transaction.commit();
      return res.status(200).json({
         message: 'Compradores insertados correctamente'
      });
   } catch (error) {
      await transaction.rollback();
      console.log('Transaction rolled back due to error:', error);
      return res.status(500).json({
         message: 'Lo sentimos hubo un error, intente nuevamente o contacte con el administrador'
      });
   }
};

export const sendVerificationEmail = async (code: string, email: string) => {
   try {

      const emailBody: string = buildEmailBody(code);
      const host: string = 'https://api.masiv.masivian.com/email/v1/delivery';
      const options = {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
            Authorization: 'Basic R2V0aW5jbG91ZC1NZXRuZXQuQXBpOjBrMmxnMkdFNlRYSA=='
         },
         body: `{
                     "Subject":"Activaci\u00F3n de cuenta",
                     "From":"Hone Solutions<gestiondocumental@honesolutions.com.co>",
                     "Template": {
                         "Type":"text/html",
                         "Value": "${emailBody}"
                     },
                     "Recipients":[{"To":"Efrain Palacios<${email}>"}]
                }`
      };
      const request = await fetch(host, options);
      if (!request.ok) {
         return { status: false, message: 'Error sending email' };
      }
      return emailBody;
   } catch (err: any) {
   }
}

export const insertCheckIn = async (req: Request, res: Response) => {
   try {
      const { name, document, phone, email, idTransaction } = req.body;

      if (!name || !document || !phone || !email) {
         return res.status(400).json({
            message: 'Por favor complete todos los campos'
         });
      }

      const buyer = await Buyer.findOne({
         where: {
            idTransaction,
            orderStatus: 0
         }
      });

      if (!buyer) {
         return res.status(400).json({
            message: 'El código no existe o ya fue utilizado'
         });
      }

      // create an uudi
      const token = crypto.randomUUID();

      const checkin = CheckIn.build({
         name,
         document,
         phone,
         email,
         used: false,
         token
      });

      await checkin.save();

      buyer.orderStatus = 1;
      await buyer.save();

      return res.status(200).json({
         checkin
      });
   } catch (error) {
      console.log('error: ', error);
      return res.status(500).json({
         message: 'Lo sentimos hubo un error, intente nuevamente o contacte con el administrador'
      });
   }
}
const buildEmailBody = (code: string) => {
   const body: string =
      `
     <!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Strict//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd'>
 <html xmlns='http://www.w3.org/1999/xhtml'>
   <head>
     <meta http-equiv='Content-Type' content='text/html; charset=utf-8'>
     <meta name='viewport' content='width=device-width, initial-scale=1.0'>
     <title>Verify your login</title>
   </head>
   <body style='font-family: Helvetica, Arial, sans-serif; margin: 0px; padding: 0px; background-color: #ffffff;'>
         <p style='padding-bottom: 16px'>
           <a href="http://localhost:8000/checkin/${code}">Verify Account</a>
         </p>
       </tbody>
     </table>
   </body>
 </html>
     `;
   return body;
}


interface BuyerRequest {
   idTransaction: string;
   idOrder: string;
   reference: string;
   name: string;
   email: string;
}