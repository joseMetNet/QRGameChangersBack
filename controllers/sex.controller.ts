import { Request, Response } from "express";
import Sex from "../models/sex-model";

export const getSexes = async (req: Request, res: Response) => {
  try {
    const sexes = await Sex.findAll();
    res.status(200).json(sexes);
  } catch (error) {
    console.error("Error al obtener los sexos:", error);
    res.status(500).json({
      message: "Error al obtener los sexos",
      error,
    });
  }
};