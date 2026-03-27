import express from 'express';
import HistoricoController from '../controllers/historicoController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();
const historicoController = new HistoricoController();

// GET /historico/estatisticas — estatísticas agregadas do aluno
router.get('/historico/estatisticas', authMiddleware, historicoController.getEstatisticas);

// GET /historico/progressao/:exercicioId — série temporal de evolução por exercício
router.get('/historico/progressao/:exercicioId', authMiddleware, historicoController.getProgressao);

export default router;
