import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();
const {DB_HOST,DB_PORT,DB_USER,DB_PASS,DB_NAME} = process.env;

const dbConnection = new Sequelize({
    username:DB_USER,
    password:DB_PASS,
    host:DB_HOST,
    port:DB_PORT,
    database:DB_NAME,
    dialect:"mysql"
});

export default dbConnection;