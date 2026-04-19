import express from 'express';
import multer from 'multer';
import ExercicioController from '../controllers/exercicioController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

const maxFileSizeMb = Number(process.env.UPLOAD_MAX_FILE_SIZE_MB || '20');

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: maxFileSizeMb * 1024 * 1024,
    },
    fileFilter: (_req, file, cb) => {
        const tiposPermitidos = ['video/webm', 'image/gif'];
        if (tiposPermitidos.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Apenas arquivos .webm e .gif são permitidos'));
        }
    }
});

const exercicioController = new ExercicioController();

//   - POST: qualquer usuário autenticado pode criar
//   - GET: qualquer usuário autenticado pode listar/visualizar
//   - PATCH: apenas criador do exercício ou ADMIN
//   - DELETE: apenas criador do exercício pessoal ou ADMIN para globais

router.post('/exercicios', authMiddleware, upload.single('animacao'), exercicioController.createExercicio);
router.get('/exercicios', authMiddleware, exercicioController.getAllExercicios);
router.get('/exercicios/:id', authMiddleware, exercicioController.getByIdExercicio);
router.patch('/exercicios/:id', authMiddleware, upload.single('animacao'), exercicioController.updateExercicio);
router.delete('/exercicios/:id', authMiddleware, exercicioController.deleteExercicio);

export default router;
