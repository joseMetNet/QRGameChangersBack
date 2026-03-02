import { Request, Response } from 'express';
import Category from '../models/categories';

export const getCategories = async (_req: Request, res: Response) => {
    try {
        const categories = await Category.findAll({
            where: { activo: true },
            order: [['nombre', 'ASC']]
        });

        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener categorías'
        });
    }
};