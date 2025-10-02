import { Request, Response, NextFunction } from "express";
import { validationResult, ValidationError } from "express-validator";
import { User } from "../models/user-model";

// Middleware para validar los endpoints con express-validator
export const validateEndpoint = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const data = errors.array().map((item: ValidationError) => {
      const field = (item as any).param || (item as any).path || "unknown";
      return {
        field,
        message: typeof item.msg === "string" ? item.msg : "Error en validación",
      };
    });

    return res.status(400).json({
      code: 400,
      message: "Error en la validación de la solicitud",
      data,
    });
  }

  next();
};

// Middleware para verificar si un email ya existe en la BD
export const checkExistingEmail = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({
        code: 400,
        message: "El campo email es requerido",
      });
    }

    const user = await User.findOne({ where: { Email: email } });

    if (user) {
      return res.status(400).json({
        code: 400,
        message: "El correo electrónico ya existe",
      });
    }

    next();
  } catch (error) {
    console.error("Error en checkExistingEmail:", error);

    return res.status(500).json({
      code: 500,
      message: "Error al verificar el correo electrónico",
    });
  }
};
