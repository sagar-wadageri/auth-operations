import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import xss from 'xss';
import authRouters from './routes/auth.route.js';
import logRouters from './routes/log.route.js';

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

app.use(cookieParser());

app.use(helmet());

//app.use(xss());

app.disable('x-powered-by');

app.use('/api/user',authRouters);
app.use('/api/logs', logRouters);

export default app;