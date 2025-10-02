import { login } from './../controllers/login.controller';
import express, { Application } from 'express';
import cors from 'cors';

import db from '../database/connection';
import userRouter from '../routes/usuario';
import authRouter from '../routes/auth';
import productRouter from '../routes/product.router';
import emergencyRouter from '../routes/emergency.router';
import eventRouter from '../routes/event.router';
import eventLocationRouter from '../routes/eventLocation.router';
import departmentRouter from '../routes/department.router';
import cityRouter from '../routes/city.router';
import siigoRouter from "../routes/siigo.router";
import motivoRouter from '../routes/motivos.router';
import countryRouter from '../routes/country.router';
import sexRouter from '../routes/sex.router';
import checkinFaceIdRouter from '../routes/checkinfaceid.router';
import bodyParser from 'body-parser';
import truoraRoutes from '../routes/truora.router';
import truoraRouter from '../routes/truora.router';
import userMeLosTomo from '../routes/userMeLosTomos.router';
import loginUser from '../routes/loginUser.router';

import wompiRouter from '../routes/wompi.router';

class Server {
    private app: Application;
    private port: string;

    constructor() {
        this.app = express();
        this.port = process.env.PORT || '8080';

        // Métodos iniciales
        this.dbConnection();
        this.middlewares();
        this.routes();
    }

    async dbConnection() {
        try {
            await db.authenticate();
            console.log("database online");
        } catch (error) {
            console.log('error: ', error);
            throw new Error("error");
        }
    }

    middlewares() {
        // CORS
        this.app.use(cors({
            origin: '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            allowedHeaders: ['Content-Type', 'Authorization']
        }));
        // Lectura del body
        // this.app.use(express.json());
        // Carpeta pública
        this.app.use(express.static('public'));

        this.app.use(bodyParser.json({ limit: '10mb' })); // importante para permitir base64 grandes
        this.app.use(bodyParser.urlencoded({ extended: true , limit: '10mb' }));

    }

    routes() {
        this.app.use("/api/auth", authRouter)
        this.app.use("/api", userRouter);
        this.app.use("/api", productRouter);
        this.app.use("/api", emergencyRouter);
        this.app.use("/api", eventRouter);
        this.app.use("/api", eventLocationRouter);
        this.app.use("/api", departmentRouter);
        this.app.use("/api", cityRouter);
        this.app.use("/api", siigoRouter);
        this.app.use("/api", motivoRouter);
        this.app.use("/api", countryRouter);
        this.app.use("/api", sexRouter)
        this.app.use("/api", checkinFaceIdRouter);
        this.app.use("/api", truoraRouter);
        this.app.use("/api", userMeLosTomo);
        this.app.use("/api", loginUser);
        this.app.use("/api", wompiRouter);
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log('Servidor corriendo en puerto ' + this.port);
        })
    }
}

export default Server;