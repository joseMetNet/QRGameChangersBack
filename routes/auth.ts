import { Router } from "express";
import { check } from "express-validator";
import { login } from "../controllers/auth";
import { validateFields } from "../middlewares/validations";

const authRouter = Router();

authRouter.post(  "/login",
[
  check("email", "El correo es obligatorio").isEmail(),
  check("password", "La contraseña es obligatoria").not().isEmpty(),
  validateFields,
],
login);

export default authRouter;