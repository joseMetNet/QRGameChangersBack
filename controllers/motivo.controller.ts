import { Request, Response } from 'express';
import Motivo from '../models/motivo-model';

export const getMotivosByIdEvent = async (req: Request, res: Response) => {
    try {
        const { idEvent } = req.params;
        if (!idEvent) {
            return res.status(400).json({ message: 'El idEvent es requerido' });
        }
        const motivos = await Motivo.findAll({
            where: { idEvent }
        });
        res.status(200).json(motivos);
        } catch (error) {
        console.error('Error al obtener motivos:', error);
        res.status(500).json({
            message: 'Error al obtener los motivos',
            error
        });
    }
}