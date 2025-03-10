import { Request, Response } from 'express';
import Product from '../models/productos';
import CheckinModel from '../models/check-in';
import crypto from 'crypto';

import { Op, UUID } from 'sequelize';
import db from '../database/connection';
import { Buyer } from "../models/buyer-model";
import { CheckIn } from "../models/checkin-model";

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

// the same function getProductByTicker but user for the buyer,
// this function is used to verify the buyer, change the status of the check-in
// and return all information
export const getProductByTicketBuyer = async (req: Request, res: Response) => {
   try {
      const { eTicket} = req.body;

      const checkIn: any = await CheckIn.findOne({
         where: {
            token: eTicket
         }
      });

      if (!checkIn) {
         return res.status(400).json({
            message: `Lo sentimos, este código no existe.`,
            user: null
         });
      }

      const user = {
         buyer_name: checkIn.name,
         participant_phone: checkIn.email,
         register_person: "test",
         name_product: "ticket"
      };

      if(checkIn.used) {
         return res.status(400).json({
            message: `El usuario ya ingresó`,
            user: null
         });
      }

      checkIn.used = true;
      await checkIn.save();

      return res.status(200).json({
         message: 'Codigó verificado exitosamente',
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

      const idTransactions = request.map(buyer => buyer.idTransaction);
      const existingBuyers = await Buyer.findAll({
         where: {
            idTransaction: {
               [Op.in]: idTransactions
            }
         },
         transaction
      });

      const existingTransactions = new Set(existingBuyers.map(buyer => buyer.idTransaction));
      const newBuyers = request.filter(buyer => !existingTransactions.has(buyer.idTransaction))
         .map(buyer => ({ ...buyer, orderStatus: 0 }));

      if (newBuyers.length === 0) {
         console.log('No new buyers to insert');
         return res.status(400).json({
            message: 'No hay nuevos compradores para insertar'
         });
      }

      await Buyer.bulkCreate(newBuyers, { transaction });

      for (const buyer of newBuyers) {
         const emailBody = await sendVerificationEmail(buyer.idTransaction, buyer.email);
         console.log("Email has been sent to:", buyer.email);
         if (!emailBody) {
            await transaction.rollback();
            return res.status(500).json({
               message: 'Lo sentimos hubo un error, intente nuevamente o contacte con el administrador'
            });
         }
      }

      await transaction.commit();
      return res.status(200).json({
         message: 'Compradores insertados correctamente'
      });
   } catch (error) {
      if (transaction) {
         await transaction.rollback();
      }
      console.log('Connection error: ', error);
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
            Authorization: 'Basic YXBpLnNpZm1hOlhWSTN5NkhHR1EySHk2djhFUHRv'
         },
         body: JSON.stringify({
            Subject: "Activación de cuenta",
            From: "🎟 ¡Tu acceso al concierto de Kris R está listo<noreply@lamejornochedetuvida.com>",
            Template: {
               Type: "text/html",
               Value: emailBody
            },
            Recipients: [{ To: `Efrain Palacios<${email}>` }]
         })
      };
      const request = await fetch(host, options);
      const responseBody = await request.json();
      if (!request.ok) {
         console.log('Error sending email to:', email);
         console.log('Response body:', responseBody);
         return null;
      }
      return emailBody;
   } catch (err: any) {
      console.log('Error sending email:', err);
      return null;
   }
};

export const insertCheckIn = async (req: Request, res: Response) => {
   try {
      const { name, document, phone, email, idTransaction } = req.body;

      if (!name || !document || !phone || !email || !idTransaction) {
         return res.status(400).json({
            message: 'Por favor complete todos los campos'
         });
      }

      const buyer = await Buyer.findOne({
         where: {
            idTransaction
         }
      });

      if (!buyer) {
         return res.status(400).json({
            message: 'El código no existe'
         });
      }

      if (buyer.orderStatus) {
         return res.status(400).json({
            message: 'El código ya fue utilizado'
         });
      }

      // create a UUID
      const token = crypto.randomUUID();

      const checkin = CheckIn.build({
         name,
         document,
         phone,
         email,
         description: buyer.description ?? '',
         used: false,
         token
      });

      await checkin.save();

      buyer.orderStatus = true;
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

export const findCheckIn = async (req: Request, res: Response) => {
   try {
      const { token } = req.query;

      if (!token) {
         return res.status(400).json({
            message: 'Por favor envie el token'
         });
      }

      const checkin = await CheckIn.findOne({
         where: { token }
      });

      if (!checkin) {
         return res.status(400).json({
            message: 'El código no existe o ya fue utilizado'
         });
      }

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

const buildEmailBody = (idTransaction: string) => {
   const body: string = `
   <!DOCTYPE html>
   <html>
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>Concierto Kris R</title>
       <style>
           body {
               font-family: Arial, sans-serif;
               margin: 0;
               padding: 0;
               background-color: #f4f4f4;
           }
           .container {
               max-width: 600px;
               margin: 0 auto;
               background: #ffffff;
               padding: 20px;
               text-align: center;
           }
           .banner {
               width: 100%;
               height: auto;
           }
           .button {
               display: inline-block;
               background-color: red;
               color: white;
               padding: 10px 20px;
               font-size: 16px;
               text-decoration: none;
               border-radius: 5px;
               margin: 15px 0;
           }
           .footer {
               font-size: 14px;
               color: #555;
           }
       </style>
   </head>
   <body>
       <div class="container">
           <p>Si no puedes ver correctamente el contenido de este mensaje, haz <a href="https://yourqrpass.com/#/checkIn?${idTransaction}">clic aquí</a>.</p>
           <a href="#">
               <img src="https://sacmaback.blob.core.windows.net/order/panel.jpg" alt="Concierto Kris R" class="banner">
           </a>
           <p>
               ¡Gracias por tu compra para el concierto de Kris R! 🎤✨
           </p>
           <p>
               Para registrar la información de la persona que asistirá al evento, por favor completa el siguiente formulario en el siguiente enlace:
           </p>
           <a href="https://yourqrpass.com/#/checkIn?x_client=${idTransaction}" class="button">Regístrate</a>
           <p class="footer">
               Una vez completado el registro, recibirás un correo con tu código QR, el cual será tu acceso al evento. Recuerda que este código solo podrá usarse una vez.<br>
               Si tienes alguna duda o inquietud, no dudes en contactarnos.<br>
               ¡Nos vemos en el concierto! 🎶🔥
           </p>
           <p>
               <strong>Equipo de Kris R</strong><br>
               <a href="https://wa.me/3046550971" style="color: #25D366; text-decoration: none; font-size: 16px;">
                   📱 WhatsApp: 304 655 0971
               </a>
           </p>
       </div>
   </body>
   </html>`;
   return body;
};

interface BuyerRequest {
   idTransaction: string;
   idOrder: string;
   reference: string;
   name: string;
   email: string;
}