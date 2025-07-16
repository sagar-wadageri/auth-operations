import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import xss from 'xss';
import authRouters from './routes/auth.route.js'

const app = express();
dotenv.config();

app.use(express.json());

app.use(cors({
    origin:[
       process.env.CLIENT_URL,
       'http://localhost:5174'
    ],
    methods:['POST','GET','DELETE','PUT']
}))

app.use(helmet());

//app.use(xss());

app.disable('x-powered-by');

app.use('/api',authRouters);

export default app;