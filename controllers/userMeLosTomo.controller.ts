import { Request, Response } from "express";
import { User } from "../models/user-model"; 
import { createUserInUserManagement } from "../helpers/UserManagment.Helper";

export const createUser = async (req: Request, res: Response) => {
    try {
        const { identification, name, lastName, email, password } = req.body;

        if (!identification || !name || !lastName || !email || !password) {
            return res.status(400).json({
                code: 400,
                message: "Todos los campos son obligatorios (identification, name, lastName, email, password)",
            });
        }

        // Verificar si ya existe
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ code: 409, message: "El usuario ya existe" });
        }

        // Crear en sistema externo
        const idAuth = await createUserInUserManagement(email, password);

        // Crear en la base de datos
        const newUser = await User.create({
            identification,
            name,
            lastName,
            email,
            idRole: 1,  // rol por defecto
            idAuth
        });

        return res.status(201).json({
            code: 201,
            message: "Usuario creado exitosamente",
            data: {
                id: newUser.get("id"),
                idAuth: newUser.get("idAuth"),
                identification: newUser.get("identification"),
                name: newUser.get("name"),
                lastName: newUser.get("lastName"),
                email: newUser.get("email"),
                idRole: newUser.get("idRole")
            }
        });

    } catch (err) {
        console.error("Error creando usuario:", err);
        return res.status(500).json({
            code: 500,
            message: "Error interno al crear el usuario"
        });
    }
};
