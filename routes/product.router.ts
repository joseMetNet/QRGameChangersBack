import { Router } from 'express';
import { getProducts, getProductByTicket, insertBuyer, insertCheckIn } from '../controllers/product.controller';




const productRouter = Router();

productRouter.get('/products', getProducts);
productRouter.post('/product', getProductByTicket);
productRouter.post('/buyer', insertBuyer);
productRouter.post('/check-in', insertCheckIn);
// productRouter.get('/product/:eTicket', getProductByTicket);



export default productRouter;