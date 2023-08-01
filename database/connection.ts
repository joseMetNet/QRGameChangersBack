import { Sequelize } from "sequelize";

const db = new Sequelize('gamechangers','gamechangers','game#123',{
    host: 'gamechangers.database.windows.net',
    dialect: 'mssql',
    //logging: false
});

export default db;
