import { Request, Response } from 'express';
import Product from '../models/productos';
import CheckinModel from '../models/check-in';
import crypto from 'crypto';

import { Op, UUID } from 'sequelize';
import db from '../database/connection';
import { Buyer } from "../models/buyer-model";
import { CheckIn } from "../models/checkin-model";
import Order from '../models/order-model';
import EventLocation from '../models/eventLocation.model';


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

export const getProductByTicketBuyer = async (req: Request, res: Response) => {
   try {
      const { eTicket } = req.body;

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
         participant_phone: checkIn.phone,
         register_person: checkIn.document,
         name_product: checkIn.description
      };

      if (checkIn.used) {
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

// export const insertOrderAndProducts = async (req: Request, res: Response) => {
//   const transaction = await db.transaction();

//   try {
//     const {
//       nombres,
//       apellidos,
//       telefono,
//       email,
//       cedula,
//       direccion,
//       idCity,
//       idDepartment,
//       idEvent,
//       localities
//     } = req.body;

//     if (!Array.isArray(localities) || localities.length === 0) {
//       return res.status(400).json({ message: 'No hay localidades seleccionadas' });
//     }

//     const eventLocationIds: number[] = localities.map((loc: { idEventLocation: number }) => loc.idEventLocation);

//     const locations = await EventLocation.findAll({
//       where: { idEventLocation: eventLocationIds }
//     });

//     const locationPriceMap: { [key: number]: number } = {};
//     locations.forEach((loc: EventLocation) => {
//       locationPriceMap[loc.idEventLocation] = Number(loc.price);
//     });

//     const total = localities.reduce((acc: number, loc: { idEventLocation: number; quantity: number }) => {
//       const price = locationPriceMap[loc.idEventLocation] || 0;
//       return acc + loc.quantity * price;
//     }, 0);

//     const order : any= await Order.create({
//       nombres,
//       apellidos,
//       telefono,
//       email,
//       cedula,
//       direccion,
//       idCity,
//       idDepartment,
//       total
//     }, { transaction });

//     const productsToInsert = [];

//     for (const loc of localities) {
//       const { idEventLocation, quantity } = loc;
//       const price = locationPriceMap[idEventLocation] || 0;

//       for (let i = 0; i < quantity; i++) {
//         productsToInsert.push({
//           idOrder: order.idOrder,
//           idEvent,
//           idEventLocation,
//           name_product: `Entrada Evento ${idEvent}`,
//           lot: `L${idEventLocation}`,
//           quantity: 1,
//           buyer_name: `${nombres} ${apellidos}`,
//           buyer_email: email,
//           lot_price: price
//         });
//       }
//     }

//     await Product.bulkCreate(productsToInsert, { transaction });
//     await transaction.commit();

//     return res.status(200).json({
//       message: 'Orden y productos registrados exitosamente',
//       entries: productsToInsert.length,
//       total,
//       orderId: order.idOrder
//     });

//   } catch (error) {
//     await transaction.rollback();
//     console.error('Error al registrar la orden:', error);
//     return res.status(500).json({
//       message: 'Error al registrar la orden',
//       error
//     });
//   }
// };

export const insertOrderAndProducts = async (req: Request, res: Response) => {
   const transaction = await db.transaction();

   try {
      const {
         nombres,
         apellidos,
         telefono,
         email,
         cedula,
         direccion,
         idCity,
         idDepartment,
         idEvent,
         localities,
         fechaHora,
         idMotivo,
         observacionesSalud,
         comentarios,
         fechaCumpleanos,
         idCountry,
         edad,
         idSexo
      } = req.body;


      let parsedLocalities;
      try {
         parsedLocalities = typeof localities === 'string' ? JSON.parse(localities) : localities;
      } catch (e) {
         return res.status(400).json({ message: 'El formato de localities no es válido' });
      }

      if (!Array.isArray(parsedLocalities) || parsedLocalities.length === 0) {
         return res.status(400).json({ message: 'No hay localidades seleccionadas' });
      }

      const eventLocationIds: number[] = parsedLocalities.map(
         (loc: { idEventLocation: number }) => loc.idEventLocation
      );

      const locations = await EventLocation.findAll({
         where: { idEventLocation: eventLocationIds }
      });

      const locationPriceMap: { [key: number]: number } = {};
      locations.forEach((loc: any) => {
         locationPriceMap[loc.idEventLocation] = Number(loc.price);
      });

      const total = parsedLocalities.reduce(
         (acc: number, loc: { idEventLocation: number; quantity: number }) => {
            const price = locationPriceMap[loc.idEventLocation] || 0;
            return acc + loc.quantity * price;
         },
         0
      );

      const orderData: any = {
         nombres,
         apellidos,
         telefono,
         email,
         cedula,
         direccion,
         idCity,
         idDepartment,
         total
      };

      if (fechaHora) orderData.fechaHora = fechaHora;
      if (idMotivo) orderData.idMotivo = idMotivo;
      if (observacionesSalud) orderData.observacionesSalud = observacionesSalud;
      if (comentarios) orderData.comentarios = comentarios;
      if (fechaCumpleanos) orderData.fechaCumpleanos = fechaCumpleanos;
      if (idCountry) orderData.idCountry = idCountry;
      if (edad) orderData.edad = edad;
      if (idSexo) orderData.idSexo = idSexo;

      const order: any = await Order.create(orderData, { transaction });

      const productsToInsert = [];

      for (const loc of parsedLocalities) {
         const { idEventLocation, quantity } = loc;
         const price = locationPriceMap[idEventLocation] || 0;

         for (let i = 0; i < quantity; i++) {
            productsToInsert.push({
               idOrder: order.idOrder,
               idEvent,
               idEventLocation,
               name_product: `Entrada Evento ${idEvent}`,
               lot: `L${idEventLocation}`,
               quantity: 1,
               buyer_name: `${nombres} ${apellidos}`,
               buyer_email: email,
               lot_price: price
            });
         }
      }

      await Product.bulkCreate(productsToInsert, { transaction });
      await transaction.commit();

      return res.status(200).json({
         message: 'Orden y productos registrados exitosamente',
         entries: productsToInsert.length,
         total,
         orderId: order.idOrder
      });
   } catch (error) {
      await transaction.rollback();
      console.error('Error al registrar la orden:', error);
      return res.status(500).json({
         message: 'Error al registrar la orden',
         error
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
         body: JSON.stringify({
            Subject: "Activación de cuenta",
            From: "🎟 ¡Tu acceso al concierto de Kris R está listo<informacion@yourqrpass.com>",
            Template: {
               Type: "text/html",
               Value: emailBody
            },
            Recipients: [{ To: `Comprador<${email}>` }]
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

export const sendCheckInEmail = async (token: string, email: string, name: string) => {
   try {
      const emailBody: string = buildQrEmailBody(token, name);
      const host: string = 'https://api.masiv.masivian.com/email/v1/delivery';
      const options = {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
            Authorization: 'Basic R2V0aW5jbG91ZC1NZXRuZXQuQXBpOjBrMmxnMkdFNlRYSA=='
         },
         body: JSON.stringify({
            Subject: "🎟 ¡Tu acceso al concierto de Kris R está listo",
            From: "<informacion@yourqrpass.com>",
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
      return request.statusText;
   }
   catch (err: any) {
      console.log('Error sending email:', err);
      return null;
   }
}

// function to send email checkin to buyer with orderStatus = 0
export const sendRemainderToCheckIn = async (req: Request, res: Response) => {
   try {
      const buyers = await Buyer.findAll({
         where: {
            orderStatus: 0
         }
      });

      if (buyers.length === 0) {
         return res.status(204).json({
            message: 'No hay compradores para enviar email'
         });
      }

      for (const buyer of buyers) {
         console.log(`Sending email to: ${buyer.email}`);
         const emailBody = await sendVerificationEmail(buyer.idTransaction, buyer.email);
         console.log("Email has been sent to:", buyer.email);
         if (!emailBody) {
            return res.status(500).json({
               message: 'Lo sentimos hubo un error, intente nuevamente o contacte con el administrador'
            });
         }
      }

      return res.status(200).json({
         message: 'Emails enviados correctamente'
      });
   } catch (error) {
      console.log('error: ', error);
      return res.status(500).json({
         message: 'Lo sentimos hubo un error, intente nuevamente o contacte con el administrador'
      });
   }
}

export const insertCheckIn = async (req: Request, res: Response) => {
   try {
      const { name, document, phone, email, idTransaction } = req.body;
      console.log('name: ', name);
      console.log('document: ', document);
      console.log('phone: ', phone);
      console.log('email: ', email);
      console.log('idTransaction: ', idTransaction);
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

      await sendCheckInEmail(token, email, name);

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

//esta con la opción de recibir un array de objetos para registrar varios checkins a la vez pero validando cada uno con su idTransaction
export const insertCheckInSeconTEst = async (req: Request, res: Response) => {
   try {
      const people = Array.isArray(req.body) ? req.body : [req.body];
      const tokens = [];
      const checkins = [];

      for (const person of people) {
         const { name, document, phone, email, idTransaction } = person;
         if (!name || !document || !phone || !email || !idTransaction) {
            return res.status(400).json({
               message: 'Por favor complete todos los campos'
            });
         }

         const buyer = await Buyer.findOne({ where: { idTransaction } });
         if (!buyer) {
            return res.status(400).json({ message: 'El código no existe' });
         }
         if (buyer.orderStatus) {
            return res.status(400).json({ message: 'El código ya fue utilizado' });
         }

         const token = crypto.randomUUID();
         const checkin = CheckIn.build({
            name, document, phone, email,
            description: buyer.description ?? '',
            used: false, token
         });
         await checkin.save();
         buyer.orderStatus = true;
         await buyer.save();
         await sendCheckInEmail(token, email, name);

         tokens.push(token);
         checkins.push(checkin);
      }

      return res.status(200).json({
         checkin: { tokens, checkins }
      });
   } catch (error) {
      console.log('error: ', error);
      return res.status(500).json({
         message: 'Lo sentimos hubo un error, intente nuevamente o contacte con el administrador'
      });
   }
};

//Recibe un array de objetos para registrar varios checkins a la vez sin validar idTransaction
export const insertCheckInArrayObjects = async (req: Request, res: Response) => {
   try {
      const people = Array.isArray(req.body) ? req.body : [req.body];
      const tokens = [];
      const checkins = [];

      for (const person of people) {
         const { idEvent, idEventLocation, name, document, phone, email } = person;
         if (!idEvent || !idEventLocation || !name || !document || !phone || !email) {
            return res.status(400).json({
               message: 'Por favor complete todos los campos'
            });
         }

         const token = crypto.randomUUID();
         const checkin = CheckIn.build({
            idEvent, idEventLocation, name, document, phone, email,
            description: '', // o cualquier otro campo por defecto
            used: false, token
         });
         await checkin.save();
         await sendCheckInEmail(token, email, name);

         tokens.push(token);
         checkins.push(checkin);
      }

      return res.status(200).json({
         checkin: { tokens, checkins }
      });
   } catch (error) {
      console.log('error: ', error);
      return res.status(500).json({
         message: 'Lo sentimos hubo un error, intente nuevamente o contacte con el administrador'
      });
   }
};

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

const buildQrEmailBody = (token: string, name: string) => {
   const body: string = `
   <!DOCTYPE html>
   <html>
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>Tu acceso al concierto de Kris R</title>
       <style>
           body {
               font-family: Arial, sans-serif;
               margin: 0;
               padding: 20px;
               background-color: #ffffff;
           }
           .container {
               max-width: 600px;
               margin: 0 auto;
               background: #ffffff;
               padding: 20px;
               text-align: left;
           }
           .highlight {
               font-weight: bold;
               color: #000;
           }
           .important {
               font-weight: bold;
               color: #d9534f;
           }
           .qr-link {
               display: block;
               font-weight: bold;
               color: #007bff;
               text-decoration: none;
               margin: 15px 0;
           }
       </style>
   </head>
   <body>
       <div class="container">
           <p><strong>📢 Tu acceso al concierto de Kris R está listo! Hola ${name},</strong></p>
           <p>¡Tu registro para el concierto de Kris R se ha completado con éxito! 🎶✨</p>
           <p>Para ingresar al evento, por favor presenta tu código QR en la entrada. Puedes verlo y mostrarlo en el siguiente enlace:</p>
           <p>🔗 <a href=https://yourqrpass.com/#/qr?token=${token} class="qr-link">[Haz clic aquí para ver tu código QR]</a></p>
           <p>⚠️ <span class="important">Importante:</span> Este código es válido solo una vez. No lo compartas con otras personas.</p>
           <p>Si tienes alguna pregunta o necesitas asistencia, no dudes en contactarnos.</p>
           <p>¡Nos vemos en el concierto! 🎤🔥</p>
           <p><strong>Equipo de Kris R</strong><br>
           Cel: 304 655-0971</p>
       </div>
   </body>
   </html>`;
   return body;
};


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