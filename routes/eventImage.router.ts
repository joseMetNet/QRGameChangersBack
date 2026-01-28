import { Router } from "express";
import {
    uploadEventImage,
    getImagesByEvent,
    updateEventImage,
    deleteEventImage
} from "../controllers/eventImage.controller";

const router = Router();

router.post("/event-images", uploadEventImage);                 // subir varias
router.get("/event-images/:eventId", getImagesByEvent);         // galería
router.put("/event-images/:idEventImage", updateEventImage);    // actualizar una
router.delete("/event-images/:idEventImage", deleteEventImage); // eliminar una

export default router;
