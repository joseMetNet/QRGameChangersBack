import { Request, Response } from 'express';
import Department from '../models/department-model';

export const getDepartments = async (req: Request, res: Response) => {
  try {
    const departments = await Department.findAll();
    res.status(200).json(departments);
  } catch (error) {
    console.error('Error al obtener los departamentos:', error);
    res.status(500).json({
      message: 'Error al obtener los departamentos',
      error
    });
  }
};
