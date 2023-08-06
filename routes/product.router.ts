import { Router } from 'express';
import { getProducts, getProductByTicket } from '../controllers/product.controller';




const productRouter = Router();

productRouter.get('/products', getProducts);
productRouter.post('/product', getProductByTicket);
// productRouter.get('/product/:eTicket', getProductByTicket);



export default productRouter;