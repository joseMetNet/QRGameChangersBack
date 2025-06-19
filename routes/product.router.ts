import { Router } from 'express';
import { getProducts, getProductByTicket, insertBuyer, insertCheckIn, findCheckIn, getProductByTicketBuyer, sendRemainderToCheckIn, insertBuyerAndProducts } from '../controllers/product.controller';




const productRouter = Router();

productRouter.get('/products', getProducts);
// productRouter.post('/product', getProductByTicket);
productRouter.post('/product', getProductByTicketBuyer)
productRouter.post('/buyer', insertBuyer);
productRouter.post('/check-in', insertCheckIn);
productRouter.post('/remainder', sendRemainderToCheckIn);
productRouter.get('/check-in', findCheckIn);
// productRouter.get('/product/:eTicket', getProductByTicket);

productRouter.post('/product/buy', insertBuyerAndProducts);



export default productRouter;