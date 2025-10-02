import { Router } from 'express';
import { getProducts, getProductByTicket, insertBuyer, insertCheckIn, findCheckIn, getProductByTicketBuyer, sendRemainderToCheckIn, insertOrderAndProducts, insertCheckInArrayObjects } from '../controllers/product.controller';
import multer from 'multer';




const productRouter = Router();
const parseFormData = multer().none();
productRouter.get('/products', getProducts);
// productRouter.post('/product', getProductByTicket);
productRouter.post('/product', getProductByTicketBuyer)
productRouter.post('/buyer', insertBuyer);
productRouter.post('/check-in', insertCheckIn);
productRouter.post('/check-in-user-alcaldia-manizales', insertCheckInArrayObjects);
productRouter.post('/remainder', sendRemainderToCheckIn);
productRouter.get('/check-in', findCheckIn);
// productRouter.get('/product/:eTicket', getProductByTicket);

//productRouter.post('/product/buy', insertOrderAndProducts);
productRouter.post(
  '/product/buy',
  parseFormData,
  insertOrderAndProducts
);


export default productRouter;