import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

export function globalErrorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
    if (err instanceof multer.MulterError) {
        const msg = err.code === 'LIMIT_FILE_SIZE'
            ? 'Arquivo excede o tamanho máximo permitido'
            : err.message;
        res.status(400).json({ error: true, code: 400, message: msg, data: null, errors: [] });
        return;
    }
    if (err instanceof Error && err.message.includes('são permitidos')) {
        res.status(400).json({ error: true, code: 400, message: err.message, data: null, errors: [] });
        return;
    }
    console.error('[Server] Erro não tratado:', err);
    res.status(500).json({ error: true, code: 500, message: 'Erro interno do servidor', data: null, errors: [] });
}
