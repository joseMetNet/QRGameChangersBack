import { Response, Request } from "express";
import jwt from "jsonwebtoken";
import Usuario from "../models/user-model";

export const validateJwt = async (req: Request, res: Response, next: any) => {
  const bearerToken = req.header("Authorization");
  if (!bearerToken) {
    return res.status(401).json({
      msg: "No existe token en la petición",
    });
  }  
  try {
    // const bearer = bearerToken.split(" ");
    // const token = bearer[1];
    // const secret: any = process.env.SECRET_KEY || "gamechangers";
    //jwt.verify(bearerToken, process.env.SECRET_KEY ||"gamechangers");

    const bearer = bearerToken.split(" ");
    const token = bearer[1];
    const secret: any = process.env.SECRET_KEY || "gamechangers";
    const payload: any = jwt.verify(token, secret);
    const user: any = await Usuario.findByPk(payload.uid);

    if (!user) {
      return res.status(401).json({
        msg: "Este usuario no existe o no tiene permisos para ejecutar esta petición",
      });
    }
    

    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({
        msg: "Token no válido"
    })
  }
};