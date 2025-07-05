import app from './app.js';
import dotenv from 'dotenv';
import dbConnection from './config/db.config.js';

dotenv.config()

const startServer = async () => {
    try {
        await dbConnection.authenticate();
        await dbConnection.sync();
        console.log(`[INFO]:[./index.js]🛢Database Connected`)
        let port = 8000;
        app.listen(port, () => {
            console.log(`[INFO]:[./index.js] ✅ Server Running On Port: ${port}`)
        })
    } catch (error) {
        console.log(`[ERROR]:[./index.js]🚫Error Occured: ${error.message}`)
    }
}

startServer()