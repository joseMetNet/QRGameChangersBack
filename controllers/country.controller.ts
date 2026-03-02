import { Request, Response } from "express";
import Country from "../models/country-model";

export const getCountries = async (req: Request, res: Response) => {
  try {
    const countries = await Country.findAll();
    res.status(200).json(countries);
  } catch (error) {
    console.error("Error al obtener los países:", error);
    res.status(500).json({
      message: "Error al obtener los países",
      error,
    });
  }
};