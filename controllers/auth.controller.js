import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import moment from "moment";
import Password from '../models/password.model.js';

import { statusCode } from "../constants.js";
import { sendResponse } from "../utils/response.util.js";
import AuthRepository from "../repositories/auth.repository.js";
import LogsRepository from "../repositories/logs.repository.js";
import OtpRepository from "../repositories/otp.repository.js";
import { sendMail, writeToHtml } from "../utils/mail.util.js";
import User from "../models/user.model.js"; // Ensure this import is correct

dotenv.config();

const authRepo = new AuthRepository();
const logRepo = new LogsRepository();
const otpRepo = new OtpRepository();

const registerHelper = (email, full_name, password, confirm_password) => {
    const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[\S]{8,}$/;

    if (!email || !full_name || !password || !confirm_password) {
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
};

class AuthController {

    async registerUser(req, res) {
        try {
            const { email, full_name, password, confirm_password } = req.body;
            const existingUser = await authRepo.getUserByParameter('email', email);
            if (existingUser) {
                return sendResponse(res, statusCode.FORBIDDEN, 'User Already Exists', null);
            }
            const message = registerHelper(email, full_name, password, confirm_password);
            if (message !== 'success') {
                return sendResponse(res, statusCode.FORBIDDEN, message, null);
            }
            const encryptedPassword = await bcrypt.hash(confirm_password, 10);
            const user = await authRepo.createUser(email, encryptedPassword, full_name);
            if (!user) {
                return sendResponse(res, statusCode.BAD_REQUEST, 'Registration failed', null);
            }
            await logRepo.createLog('User Registration', user.id);
            return sendResponse(res, statusCode.CREATED, 'User Registered Successfully', null);
        } catch (error) {
            console.error('[ERROR][registerUser]:', error.message);
            return sendResponse(res, statusCode.INTERNAL_SERVER_ERROR, 'Internal Server Error', null);
        }
    }

    async loginUser(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return sendResponse(res, statusCode.BAD_REQUEST, 'Email or Password should not be empty', null);
            }

            const user = await authRepo.getUserByParameter('email', email);
            if (!user) {
                return sendResponse(res, statusCode.NOT_FOUND, 'User Not Found', null);
            }

            const isMatching = await bcrypt.compare(password, user.password);
            if (!isMatching) {
                return sendResponse(res, statusCode.FORBIDDEN, 'Email or Password is wrong!!', null);
            }

            const userData = { user_id: user.id, email: user.email };
            const accessToken = jwt.sign({ userData }, process.env.JWT_SECRET, { expiresIn: '1d' });

            res.cookie("access_token", accessToken, {
                httpOnly: true,
                secure: false,
                sameSite: 'none'
            }).status(statusCode.SUCCESS).json({
                success: true,
                message: 'User logged in successfully',
                data: null
            });
        } catch (error) {
            console.error('[ERROR][loginUser]:', error.message);
            return sendResponse(res, statusCode.INTERNAL_SERVER_ERROR, 'Internal Server Error', null);
        }
    }

    async generateOtp(req, res) {
        try {
            const { email } = req.body;
            const user = await authRepo.getUserByParameter('email', email);
            if (!user) {
                return sendResponse(res, statusCode.NOT_FOUND, 'User not Found', null);
            }

            const otp = Math.floor(100000 + Math.random() * 900000);
            const otpExpiry = moment().add(1, "day").format("YYYY-MM-DD HH:mm:ss");

            const htmlBody = await writeToHtml({
                user_name: user.full_name,
                start_content: 'Hi, this is your OTP to reset your password.',
                main_content: `OTP: ${otp}`
            }, "RESET_PASS");

            const mailOptions = {
                fromMail: 'sagarwadageri315@gmail.com',
                toMail: user.email,
                subject: 'Reset Password',
                htmlBody
            };

            const isOtpCreated = await otpRepo.createOtp(otp, otpExpiry, user.id);
            if (!isOtpCreated) {
                return sendResponse(res, statusCode.BAD_REQUEST, "OTP generation failed", null);
            }

            await sendMail(mailOptions);
            return sendResponse(res, statusCode.SUCCESS, "OTP sent to your mail", null);
        } catch (error) {
            console.error('[ERROR][generateOtp]:', error.message);
            return sendResponse(res, statusCode.INTERNAL_SERVER_ERROR, 'Internal Server Error', null);
        }
    }

    async verifyOtp(req, res) {
        try {
            const { user_id, otp } = req.body;
            if (!user_id || !otp) {
                return sendResponse(res, statusCode.BAD_REQUEST, 'User ID and OTP required', null);
            }

            const otpRecord = await otpRepo.getOtpRecord(user_id, otp);
            if (!otpRecord) {
                return sendResponse(res, statusCode.NOT_FOUND, 'Invalid OTP or User ID', null);
            }

            if (moment(otpRecord.expiry).isBefore(moment()) || otpRecord.is_verified) {
                return sendResponse(res, statusCode.BAD_REQUEST, 'OTP expired or already used', null);
            }

            otpRecord.is_verified = true;
            await otpRecord.save();

            return sendResponse(res, statusCode.SUCCESS, 'OTP verified successfully', null);
        } catch (error) {
            console.error('[ERROR][verifyOtp]:', error.message);
            return sendResponse(res, statusCode.INTERNAL_SERVER_ERROR, 'Internal Server Error', null);
        }
    }

    async resetPassword(req, res) {
        try {
            const { userId, newPassword, confirmPassword } = req.body;

            // Validate required fields
            if (!userId || !newPassword || !confirmPassword) {
                return res.status(400).json({ message: 'All fields required' });
            }
            const lastPasswords = await authRepo.lastThreePass(userId);
            for (const old of lastPasswords) {
                const isSame = await bcrypt.compare(newPassword, old.password);
                if (isSame) {
                    return sendResponse(res,statusCode.FORBIDDEN,"cannot use laast three password",null)
                }
            }
            // Check if passwords match
            if (newPassword !== confirmPassword) {
                return res.status(400).json({ message: 'Passwords do not match' });
            }

            // Check OTP status
            const otpRec = await otpRepo.latestVerifiedButUnused(userId);
            console.log('[OTP RECORDS]', JSON.stringify(otpRec))
            if (!otpRec) {
                return res.status(400).json({ message: 'OTP not verified or Expired' });
            }

            if (otpRec.is_verified === false) {
                return sendResponse(res, statusCode.BAD_REQUEST, 'Please verify the otp to continue', null);
            }

            if (otpRec.is_deleted === true) {
                return sendResponse(res, statusCode.BAD_REQUEST, 'Please Generate New OTP to Continue', null);
            }

            if (moment(otpRec.expiry).isBefore(moment())) {
                return sendResponse(res, statusCode.BAD_REQUEST, 'OTP expired or already used', null);
            }

            const user = authRepo.getUserByParameter('id', userId);

            if (!user) {
                return sendResponse(res, statusCode.NOT_FOUND, 'User Not Exists', null);
            }

            const hashedPassword = await bcrypt.hash(confirmPassword, 10);
            const userObject = {
                password: hashedPassword,
                otp_id: otpRec.id,
                user_id: userId
            }
            // Hash password and fetch user in parallel
            const isPasswordUpdated = await authRepo.updateUser(userObject);
            if (!isPasswordUpdated) {
                return sendResponse(res, statusCode.BAD_REQUEST, 'Password Update Failed', null)
            }
            return res.status(200).json({ message: 'Password reset successful' });

        } catch (error) {
            console.error('[ERROR][resetPassword]:', error.message);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }
}

export default AuthController;
