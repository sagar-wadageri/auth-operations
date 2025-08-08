import express from 'express';
import AuthController from '../controllers/auth.controller.js';

const auth = new AuthController();
const router = express.Router();

router.post('/register',auth.registerUser);
router.post('/reset-password', auth.resetPassword);
router.post('/login',auth.loginUser);
router.post('/generate-otp',auth.generateOtp);
router.post('/verify-otp', auth.verifyOtp);

export default router;