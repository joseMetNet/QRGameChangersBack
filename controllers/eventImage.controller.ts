import { Request, Response } from "express";
import { BlobServiceClient } from "@azure/storage-blob";
import multer from "multer";
import Event from "../models/event-model";
import EventImage from "../models/eventImage-model";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { files: 10 },
});

const AZURE_STORAGE_CONNECTION_STRING_EVENT_IMAGE =
    process.env.AZURE_STORAGE_CONNECTION_STRING_EVENT_IMAGE!;

const containerName = "event-images";
const blobServiceClient =
    BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING_EVENT_IMAGE);

const containerClient = blobServiceClient.getContainerClient(containerName);

export const uploadEventImage = [
    upload.array("images", 10),
    async (req: Request, res: Response) => {
        try {
            const files = req.files as Express.Multer.File[];
            const { eventId } = req.body;

            // 🔐 Validaciones
            if (!eventId) {
                return res.status(400).json({ message: "eventId es obligatorio" });
            }

            if (!files || files.length === 0) {
                return res.status(400).json({ message: "No se enviaron imágenes" });
            }

            if (files.length > 10) {
                return res.status(400).json({ message: "Máximo 10 imágenes permitidas" });
            }

            const event = await Event.findByPk(eventId);
            if (!event) {
                return res.status(404).json({ message: "Evento no encontrado" });
            }

            const uploadedImages: string[] = [];

            // 🔁 Subir imágenes a Azure y guardar en TB_EventImage
            for (const file of files) {
                const uniqueName = `${Date.now()}-${Math.random()
                    .toString(36)
                    .substring(2)}-${file.originalname}`;

                const blockBlobClient =
                    containerClient.getBlockBlobClient(uniqueName);

                await blockBlobClient.uploadData(file.buffer, {
                    blobHTTPHeaders: {
                        blobContentType: file.mimetype,
                    },
                });

                await EventImage.create({
                    idEvent: eventId,
                    imageUrl: blockBlobClient.url,
                });

                uploadedImages.push(blockBlobClient.url);
            }

            return res.status(200).json({
                message: "Imágenes subidas correctamente",
                total: uploadedImages.length,
                images: uploadedImages,
            });

        } catch (error) {
            console.error("Error al subir imágenes:", error);
            return res.status(500).json({
                message: "Error interno al subir imágenes",
            });
        }
    },

];

export const getImagesByEvent = async (req: Request, res: Response) => {
    try {
        const { eventId } = req.params;

        if (!eventId) {
            return res.status(400).json({ message: "eventId es obligatorio" });
        }

        const images = await EventImage.findAll({
            where: { idEvent: Number(eventId) },
            order: [["createdAt", "ASC"]], // ✅ orden seguro
        });

        return res.status(200).json(images);

    } catch (error) {
        console.error("Error al obtener imágenes:", error);
        return res.status(500).json({
            message: "Error interno al obtener imágenes",
        });
    }
};


export const updateEventImage = [
    upload.single("image"),
    async (req: Request, res: Response) => {
        try {
            const { idEventImage } = req.params;
            const file = req.file;

            if (!file) {
                return res.status(400).json({ message: "No se envió imagen" });
            }

            const image = await EventImage.findByPk(idEventImage);
            if (!image) {
                return res.status(404).json({ message: "Imagen no encontrada" });
            }

            const uniqueName = `${Date.now()}-${Math.random()
                .toString(36)
                .substring(2)}-${file.originalname}`;

            const blockBlobClient =
                containerClient.getBlockBlobClient(uniqueName);

            await blockBlobClient.uploadData(file.buffer, {
                blobHTTPHeaders: {
                    blobContentType: file.mimetype,
                },
            });

            image.imageUrl = blockBlobClient.url;
            await image.save();

            return res.status(200).json({
                message: "Imagen actualizada",
                image,
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Error al actualizar imagen",
            });
        }
    },
];
export const deleteEventImage = async (req: Request, res: Response) => {
    try {
        const { idEventImage } = req.params;

        const image = await EventImage.findByPk(idEventImage);

        if (!image) {
            return res.status(404).json({
                message: "Imagen no encontrada",
            });
        }

        await image.destroy();

        return res.status(200).json({
            message: "Imagen eliminada correctamente",
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Error al eliminar imagen",
        });
    }
};


