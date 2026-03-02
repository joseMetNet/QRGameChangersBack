import { Router } from "express";
import { login } from "../controllers/login.controller";
import { body } from "express-validator";
import { validateEndpoint } from "../middlewares/validatorEnpoint";

const router = Router();

router.post(
    "/loginUser",
    [
        body("email")
            .notEmpty()
            .withMessage("El correo es obligatorio")
            .isEmail()
            .withMessage("Debe ser un correo válido"),

        body("password")
            .notEmpty()
            .withMessage("La contraseña es obligatoria")
            .isString()
            .withMessage("La contraseña debe ser un texto"),

        validateEndpoint
    ],
    login
);

export default router;
