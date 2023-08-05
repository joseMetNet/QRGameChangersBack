import express, { Application } from 'express';
import cors from 'cors';

import db from '../database/connection';
import userRouter from '../routes/usuario';
import authRouter from '../routes/auth';
import productRouter from '../routes/product.router';



class Server {

    private app: Application;
    private port: string;
    // private apiPaths = {
    //     usuarios: '/api/usuarios',
    //     router: '/login'
    // }

    constructor() {
        this.app  = express();
        this.port = process.env.PORT || '8000';

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
          console.log('error: ',error);
          throw new Error("error");
        }
      }

    middlewares() {
        // CORS
        this.app.use( cors() );
        // Lectura del body
        this.app.use( express.json() );
        // Carpeta pública
        this.app.use( express.static('public') );
    }


    routes() {
        // this.app.use(this.apiPaths.router, authRoutes);
        // this.app.use( this.apiPaths.usuarios, userRoutes )
        this.app.use("/api/auth", authRouter)
        this.app.use("/api", userRouter);
        this.app.use("/api", productRouter);
    }


    listen() {
        this.app.listen( this.port, () => {
            console.log('Servidor corriendo en puerto ' + this.port );
        })
    }

}

export default Server;