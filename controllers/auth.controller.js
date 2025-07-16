import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { statusCode } from "../constants.js";
import { sendResponse } from "../utils/response.util.js";
import AuthRepository from "../repositories/auth.repository.js";

dotenv.config();
const authRepo = new AuthRepository();

const registerHelper = (email, full_name, password, confirm_password) => {
    const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[\S]{8,}$/;

    if (email === '' || full_name === '' || password === '' || confirm_password === '') {
        return 'All Fields are mandatory';
    }
    if (!regexEmail.test(email)) {
        return 'Use a proper email id';
    }
    if (!regexPassword.test(confirm_password)) {
        return 'Use a proper password format: Example: RootUser@2002';
    }
    if (password !== confirm_password) {
        return 'Passwords mismatched';
    }
    return 'success';
}

class AuthController {
    async registerUser(req, res) {
        try {
            const { email, full_name, password, confirm_password } = req.body;
            const message = registerHelper(email, full_name, password, confirm_password);
            if(message!=='success'){
                return sendResponse(res,statusCode.FORBIDDEN,message,null);
            }
            const encryptedPassword = await bcrypt.hash(confirm_password,10);
            const isCreated = await authRepo.createUser(email,encryptedPassword,full_name);
            if(!isCreated){
                return sendResponse(res,statusCode.BAD_REQUEST,'Registration failed',null)
            }
            return sendResponse(res,statusCode.CREATED,'User Registered Successfully',null);
        } catch (error) {
            console.error('[ERROR]:[controllers/auth.controller.js]:[AuthController.registerUser()]:Error Occurred: ', error.message);
            sendResponse(res, statusCode.INTERNAL_SERVER_ERROR, 'Internal Server Error', null)
        }
    }

    async loginUser(req,res) {
        try {
            const { email, password } = req.body;
            if(email===''||password===''){
                console.log('[ERROR]:[controllers/auth.controller.js]:[AuthController.loginUser()]:Error Occurred: One of the field is empty - ',JSON.stringify(req.body));
                sendResponse(res,statusCode.BAD_REQUEST,'Email or Password should not be empty',null);
            }
            const user = await authRepo.getUserByParameter('email',email);
            if(!user){
                return sendResponse(res,statusCode.NOT_FOUND,'User Bot Found',null);
            }
            console.log(`[]:[]:User Data ${user}`)
            const userPass = user.password;
            const userData = {
                user_id: user.id,
                email: user.email
            }
            const isMatching = await bcrypt.compare(password,userPass);
            if(!isMatching){
                console.error(`[]:[]:[]:User not found ${user.id}`)
                return sendResponse(res,statusCode.FORBIDDEN,'Email or Password is wrong!!');
            } 
            
            const accessToken = jwt.sign({userData},process.env.JWT_SECRET,{
                expiresIn:'1d'
            });
             res.cookie(
                "access_token",
                accessToken,
                {
                    httpOnly:true,
                    secure:false,
                    sameSite:'none'
                }
            ).status(statusCode.SUCCESS)
            .json({
                success:true,
                message:'user logged in successfully',
                data:null
            })
        } catch (error) {
            console.error('[ERROR]:[controllers/auth.controller.js]:[AuthController.loginUser()]:Error Occurred: ', error.message);
            sendResponse(res, statusCode.INTERNAL_SERVER_ERROR, 'Internal Server Error', null) 
        }
    }
}

export default AuthController;