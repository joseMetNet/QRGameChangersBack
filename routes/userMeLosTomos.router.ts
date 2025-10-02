import { Router } from "express";
import { body } from "express-validator";
import { createUser } from "../controllers/userMeLosTomo.controller";
import { validateEndpoint } from "../middlewares/validatorEnpoint";

const router = Router();

router.post(
    "/create-user",
    [
        body("identification")
            .notEmpty().withMessage("identification es requerido")
            .isString().withMessage("identification debe ser texto"),

        body("name")
            .notEmpty().withMessage("name es requerido")
            .isString().withMessage("name debe ser texto"),

        body("lastName")
            .notEmpty().withMessage("lastName es requerido")
            .isString().withMessage("lastName debe ser texto"),

        body("email")
            .notEmpty().withMessage("email es requerido")
            .isEmail().withMessage("email debe ser válido"),

        body("password")
            .notEmpty().withMessage("password es requerido")
            .isString().withMessage("password debe ser texto"),

        validateEndpoint
    ],
    createUser
);

export default router;
