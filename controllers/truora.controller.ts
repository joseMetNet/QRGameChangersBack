import { Request, Response } from 'express';
import { crearEnrollmentForfacialRecognition, crearValidacionTruora, crearValidationForfacialRecognition, getEnrollmentForfacialRecognitionCreated, getValidationAccountsDocs, getValidationDocs, getValidationForfacialRecognition } from '../services/truora.service';

export const crearValidacion = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const result = await crearValidacionTruora(data);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Error al crear validación', details: err.message });
  }
};

export const crearEnrollmentRecognition = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const result = await crearEnrollmentForfacialRecognition(data);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Error al crear validación', details: err.message });
  }
};

export const crearValidationRecognition = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const result = await crearValidationForfacialRecognition(data);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Error al crear validación', details: err.message });
  }
};

// GET para obtner cuentas de documentos
export const obtenerAccountsDocs = async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    const result = await getValidationAccountsDocs(accountId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Error al obtener registros de cuenta', details: err.message });
  }
};

//  GET para documentos
export const obtenerValidationDocs = async (req: Request, res: Response) => {
  try {
    const { validationId } = req.params;
    const result = await getValidationDocs(validationId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Error al obtener validación de documentos', details: err.message });
  }
};

//  GET para facial recognition
export const obtenerValidationFacialRecognition = async (req: Request, res: Response) => {
  try {
    const { idValidation } = req.params;
    const result = await getValidationForfacialRecognition(idValidation);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Error al obtener validación facial', details: err.message });
  }
};

//  GET para facial recognition del enrolment creado
export const obtenerEnrollmentFacialRecognitionCreated = async (req: Request, res: Response) => {
  try {
    const { enrollmentId } = req.params;
    const result = await getEnrollmentForfacialRecognitionCreated(enrollmentId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Error al obtener validación facial', details: err.message });
  }
};