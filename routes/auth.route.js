import express from 'express';
import AuthController from '../controllers/auth.controller.js';

const auth = new AuthController();
const router = express.Router();

router.post('/user/register',auth.registerUser);
router.post('/user/login',auth.loginUser);

export default router;