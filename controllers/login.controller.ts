import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import db from "../database/connection";
import { QueryTypes } from "sequelize";
import { generateJWT, parseJwt } from "../helpers/generateJWT";
import { authenticateUser } from "../helpers/UserManagment.Helper";

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body as { email?: string; password?: string };

        if (!email || !password) {
            return res.status(400).json({
                code: 400,
                message: "El correo y la contraseña son obligatorios",
            });
        }

        const normalizedEmail = String(email).trim().toLowerCase();

        const checkUserQuery = `
        SELECT 1 AS existsUser
        FROM dbo.TB_USER_ME_LOS_TOMO
        WHERE LTRIM(RTRIM(LOWER(email))) = :email
    `;

        const checkResult: any[] = await db.query(checkUserQuery, {
            type: QueryTypes.SELECT,
            replacements: { email: normalizedEmail },
        });

        if (!checkResult?.length) {
            return res.status(404).json({
                code: 404,
                message: { translationKey: "login.error_user_not_found" },
            });
        }

        await authenticateUser(normalizedEmail, password);

        const userQuery = `
        SELECT TOP 1
        u.id,
        u.idAuth,
        u.identification,
        u.idRole,
        u.name,
        u.lastName,
        u.email
        FROM dbo.TB_USER_ME_LOS_TOMO AS u
        WHERE LTRIM(RTRIM(LOWER(u.email)))= :email;
    `;

        const result: any[] = await db.query(userQuery, {
            type: QueryTypes.SELECT,
            replacements: { email: normalizedEmail },
        });

        const user = result?.[0];
        if (!user) {
            return res.status(404).json({
                code: 404,
                message: { translationKey: "login.error_user_not_found" },
            });
        }

        const payloadForToken = {
            id: user.id,
            idAuth: user.idAuth,
            email: user.email,
            roleId: user.idRole,
            role: user.role,
        };

        const token = await generateJWT(payloadForToken);
        const decoded = (await parseJwt(token)) as { exp?: number } | undefined;

        return res.status(200).json({
            code: 200,
            data: {
                user: {
                    id: user.id,
                    idAuth: user.idAuth,
                    identification: user.identification,
                    role: user.role,
                    name: user.name,
                    lastName: user.lastName,
                    email: user.email,
                },
                token,
                expiresAt: decoded?.exp ? new Date(decoded.exp * 1000).toISOString() : null,
                expiresInSeconds: decoded?.exp
                    ? Math.max(0, decoded.exp * 1000 - Date.now()) / 1000
                    : null,
            },
        });
    } catch (err: any) {
        if (err?.response?.status === 401 || err?.status === 401) {
            return res.status(401).json({
                code: 401,
                message: { translationKey: "login.error_invalid_credentials" },
            });
        }

        console.error("Error al loguearse:", err);
        return res.status(500).json({ code: 500, message: "Error interno al procesar el login" });
    }
};