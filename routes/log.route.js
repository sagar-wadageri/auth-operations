import express from 'express';
import LogController from '../controllers/logs.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();
const logController = new LogController();

router.get('/get-logs', authenticate,logController.fetchMyLogs)

export default router;