import * as dotenv from "dotenv";
dotenv.config();


export const sqlServer = {
    DB_CONNECTION:  process.env.SQLSERVER_DB_CONNECTION || "mssql",
    DB_HOST:  process.env.SQLSERVER_DB_HOST || "gamechangers.database.windows.net",
    DB_PORT:  process.env.SQLSERVER_DB_PORT || "1433",
    DB_DATABASE:  process.env.SQLSERVER_DB_DATABASE || "gamechangers",
    DB_USERNAME:  process.env.SQLSERVER_DB_USERNAME || "gamechangers",
    DB_PASSWORD:  process.env.SQLSERVER_DB_PASSWORD || "game#123",
};
