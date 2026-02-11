import { Router } from 'express';
import { uploadEventCover } from '../controllers/event.controller';
import { uploadSingle } from '../middlewares/uploadFile';

const router = Router();

router.post('/:idEvent', uploadSingle, uploadEventCover);

export default router;
