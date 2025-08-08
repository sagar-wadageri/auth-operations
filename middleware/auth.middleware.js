import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { sendResponse } from '../utils/response.util.js';
import { statusCode } from '../constants.js';

dotenv.config();

export const authenticate = async (req,res,next) => {
    try {
        const token = req.cookies.access_token;
        if(!token){
            return sendResponse(res, statusCode.FORBIDDEN, 'Please Login',null)
        }
        const destructuredToken = jwt.verify(token,process.env.JWT_SECRET);
        if(!destructuredToken){
            return sendResponse(res, statusCode.FORBIDDEN, 'Please Login',null)
        }
        req.user = destructuredToken.userData;
        console.log('Auth User',req.user)
        next();
    } catch (error) {
        throw error;
    }
}
