import express from 'express';
import HistoricoController from '../controllers/historicoController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();
const historicoController = new HistoricoController();

// GET /historico/estatisticas — estatísticas agregadas do aluno
router.get('/historico/estatisticas', authMiddleware, historicoController.getEstatisticas);

// GET /historico/progressao/:exercicioId — série temporal de evolução por exercício
router.get('/historico/progressao/:exercicioId', authMiddleware, historicoController.getProgressao);

// GET /historico/grupos-musculares — distribuição de séries por grupo muscular
router.get('/historico/grupos-musculares', authMiddleware, historicoController.getGruposMusculares);

// GET /historico/exercicios-frequentes — exercícios mais treinados no período
router.get('/historico/exercicios-frequentes', authMiddleware, historicoController.getExerciciosFrequentes);

// GET /historico/comparativo — período atual vs período anterior
router.get('/historico/comparativo', authMiddleware, historicoController.getComparativo);

export default router;
