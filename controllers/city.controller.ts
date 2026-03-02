import { Request, Response } from 'express';
import City from '../models/city-model';

export const getCitiesByDepartment = async (req: Request, res: Response) => {
  const { idDepartment } = req.params;

  if (!idDepartment) {
    return res.status(400).json({ message: 'El idDepartment es requerido' });
  }

  try {
    const cities = await City.findAll({
      where: { idDepartment }
    });

    res.status(200).json(cities);
  } catch (error) {
    console.error('Error al obtener ciudades:', error);
    res.status(500).json({
      message: 'Error al obtener las ciudades',
      error
    });
  }
};
