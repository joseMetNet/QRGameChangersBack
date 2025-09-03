import { Request, Response } from "express";
import { BlobServiceClient } from "@azure/storage-blob";
import multer from "multer";
import Event from "../models/event-model";

const upload = multer({ storage: multer.memoryStorage() });

const AZURE_STORAGE_CONNECTION_STRING_EVENT_IMAGE = process.env.AZURE_STORAGE_CONNECTION_STRING_EVENT_IMAGE!;
const containerName = "event-images"; // 👈 asegúrate de crear este contenedor en Azure
const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING_EVENT_IMAGE);
const containerClient = blobServiceClient.getContainerClient(containerName);

export const uploadEventImage = [
    upload.single("image"), // el form debe enviar { image: file, eventId: id }
    async (req: Request, res: Response) => {
        try {
            const file = req.file;
            const { eventId } = req.body;

            if (!file) {
                return res.status(400).json({ message: "No se envió ninguna imagen" });
            }

            // Subir al Blob Storage
            const blobName = `${Date.now()}-${file.originalname}`;
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);

            await blockBlobClient.uploadData(file.buffer, {
                blobHTTPHeaders: { blobContentType: file.mimetype },
            });

            const imageUrl = blockBlobClient.url;

            // Guardar en la BD (columna eventImage)
            const event = await Event.findByPk(eventId);
            if (!event) {
                return res.status(404).json({ message: "Evento no encontrado" });
            }

            event.eventImage = imageUrl;
            await event.save();

            res.status(200).json({
                message: "Imagen subida y asociada al evento",
                imageUrl,
            });
        } catch (error) {
            console.error("Error al subir imagen:", error);
            res.status(500).json({ message: "Error interno", error });
        }
    },
];
