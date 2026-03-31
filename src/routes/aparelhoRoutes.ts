import express from 'express';
import AparelhoController from '../controllers/aparelhoController';
import { authMiddleware } from '../middlewares/authMiddleware';
const router = express.Router();

const aparelhoController = new AparelhoController();

router.get('/aparelhos', authMiddleware, aparelhoController.getAll);
router.get('/aparelhos/:id', authMiddleware, aparelhoController.getById);

export default router;
