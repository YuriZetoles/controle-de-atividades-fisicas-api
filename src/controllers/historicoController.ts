import HistoricoService from '../services/historicoService';
import { Request, Response } from 'express';
import CommonResponse from '../utils/helpers/commonResponse';
import { ZodError } from 'zod';
import HttpStatusCode from '../utils/helpers/httpStatusCode';
import { DatabaseError } from '../utils/errors/DatabaseError';

class HistoricoController {
    private service: HistoricoService;

    constructor() {
        this.service = new HistoricoService();
    }

    getEstatisticas = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id as string;
            const resposta = await this.service.getEstatisticas(req.query, userId);
            return CommonResponse.success(res, resposta);
        } catch (error) {
            if (error instanceof ZodError) {
                return CommonResponse.error(res, HttpStatusCode.UNPROCESSABLE_ENTITY.code, null, null, error.issues, HttpStatusCode.UNPROCESSABLE_ENTITY.message);
            }
            if (error instanceof DatabaseError) {
                return CommonResponse.error(res, error.statusCode, null, null, [error.toJSON()], error.message);
            }
            if (error instanceof Error) {
                if (error.message.startsWith('FORBIDDEN:')) {
                    return CommonResponse.error(res, HttpStatusCode.FORBIDDEN.code, null, null, [], error.message.replace('FORBIDDEN: ', ''));
                }
                if (error.message.startsWith('UNPROCESSABLE:')) {
                    return CommonResponse.error(res, HttpStatusCode.UNPROCESSABLE_ENTITY.code, null, null, [], error.message.replace('UNPROCESSABLE: ', ''));
                }
            }
            const msg = error instanceof Error ? error.message : 'Erro desconhecido';
            console.error('[HistoricoController] [getEstatisticas] Erro interno:', msg);
            return CommonResponse.serverError(res, { message: msg }, HttpStatusCode.INTERNAL_SERVER_ERROR.message);
        }
    }

    getProgressao = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id as string;
            const resposta = await this.service.getProgressao(
                req.params.exercicioId as string,
                req.query,
                userId,
            );
            return CommonResponse.success(res, resposta);
        } catch (error) {
            if (error instanceof ZodError) {
                return CommonResponse.error(res, HttpStatusCode.UNPROCESSABLE_ENTITY.code, null, null, error.issues, HttpStatusCode.UNPROCESSABLE_ENTITY.message);
            }
            if (error instanceof DatabaseError) {
                return CommonResponse.error(res, error.statusCode, null, null, [error.toJSON()], error.message);
            }
            if (error instanceof Error) {
                if (error.message.startsWith('FORBIDDEN:')) {
                    return CommonResponse.error(res, HttpStatusCode.FORBIDDEN.code, null, null, [], error.message.replace('FORBIDDEN: ', ''));
                }
                if (error.message.startsWith('UNPROCESSABLE:')) {
                    return CommonResponse.error(res, HttpStatusCode.UNPROCESSABLE_ENTITY.code, null, null, [], error.message.replace('UNPROCESSABLE: ', ''));
                }
            }
            const msg = error instanceof Error ? error.message : 'Erro desconhecido';
            console.error('[HistoricoController] [getProgressao] Erro interno:', msg);
            return CommonResponse.serverError(res, { message: msg }, HttpStatusCode.INTERNAL_SERVER_ERROR.message);
        }
    }

    getGruposMusculares = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id as string;
            const resposta = await this.service.getGruposMusculares(req.query, userId);
            return CommonResponse.success(res, resposta);
        } catch (error) {
            if (error instanceof ZodError) {
                return CommonResponse.error(res, HttpStatusCode.UNPROCESSABLE_ENTITY.code, null, null, error.issues, HttpStatusCode.UNPROCESSABLE_ENTITY.message);
            }
            if (error instanceof DatabaseError) {
                return CommonResponse.error(res, error.statusCode, null, null, [error.toJSON()], error.message);
            }
            if (error instanceof Error) {
                if (error.message.startsWith('FORBIDDEN:')) {
                    return CommonResponse.error(res, HttpStatusCode.FORBIDDEN.code, null, null, [], error.message.replace('FORBIDDEN: ', ''));
                }
                if (error.message.startsWith('UNPROCESSABLE:')) {
                    return CommonResponse.error(res, HttpStatusCode.UNPROCESSABLE_ENTITY.code, null, null, [], error.message.replace('UNPROCESSABLE: ', ''));
                }
            }
            const msg = error instanceof Error ? error.message : 'Erro desconhecido';
            console.error('[HistoricoController] [getGruposMusculares] Erro interno:', msg);
            return CommonResponse.serverError(res, { message: msg }, HttpStatusCode.INTERNAL_SERVER_ERROR.message);
        }
    }

    getExerciciosFrequentes = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id as string;
            const resposta = await this.service.getExerciciosFrequentes(req.query, userId);
            return CommonResponse.success(res, resposta);
        } catch (error) {
            if (error instanceof ZodError) {
                return CommonResponse.error(res, HttpStatusCode.UNPROCESSABLE_ENTITY.code, null, null, error.issues, HttpStatusCode.UNPROCESSABLE_ENTITY.message);
            }
            if (error instanceof DatabaseError) {
                return CommonResponse.error(res, error.statusCode, null, null, [error.toJSON()], error.message);
            }
            if (error instanceof Error) {
                if (error.message.startsWith('FORBIDDEN:')) {
                    return CommonResponse.error(res, HttpStatusCode.FORBIDDEN.code, null, null, [], error.message.replace('FORBIDDEN: ', ''));
                }
                if (error.message.startsWith('UNPROCESSABLE:')) {
                    return CommonResponse.error(res, HttpStatusCode.UNPROCESSABLE_ENTITY.code, null, null, [], error.message.replace('UNPROCESSABLE: ', ''));
                }
            }
            const msg = error instanceof Error ? error.message : 'Erro desconhecido';
            console.error('[HistoricoController] [getExerciciosFrequentes] Erro interno:', msg);
            return CommonResponse.serverError(res, { message: msg }, HttpStatusCode.INTERNAL_SERVER_ERROR.message);
        }
    }

    getRecordeExercicio = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id as string;
            const resposta = await this.service.getRecordeExercicio(
                req.params.exercicioId as string,
                req.query,
                userId,
            );
            return CommonResponse.success(res, resposta);
        } catch (error) {
            if (error instanceof ZodError) {
                return CommonResponse.error(res, HttpStatusCode.UNPROCESSABLE_ENTITY.code, null, null, error.issues, HttpStatusCode.UNPROCESSABLE_ENTITY.message);
            }
            if (error instanceof DatabaseError) {
                return CommonResponse.error(res, error.statusCode, null, null, [error.toJSON()], error.message);
            }
            if (error instanceof Error) {
                if (error.message === 'Exercício não encontrado') {
                    return CommonResponse.error(res, HttpStatusCode.NOT_FOUND.code, null, null, [], error.message);
                }
                if (error.message.startsWith('FORBIDDEN:')) {
                    return CommonResponse.error(res, HttpStatusCode.FORBIDDEN.code, null, null, [], error.message.replace('FORBIDDEN: ', ''));
                }
                if (error.message.startsWith('UNPROCESSABLE:')) {
                    return CommonResponse.error(res, HttpStatusCode.UNPROCESSABLE_ENTITY.code, null, null, [], error.message.replace('UNPROCESSABLE: ', ''));
                }
            }
            const msg = error instanceof Error ? error.message : 'Erro desconhecido';
            console.error('[HistoricoController] [getRecordeExercicio] Erro interno:', msg);
            return CommonResponse.serverError(res, { message: msg }, HttpStatusCode.INTERNAL_SERVER_ERROR.message);
        }
    }

    getComparativo = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id as string;
            const resposta = await this.service.getComparativo(req.query, userId);
            return CommonResponse.success(res, resposta);
        } catch (error) {
            if (error instanceof ZodError) {
                return CommonResponse.error(res, HttpStatusCode.UNPROCESSABLE_ENTITY.code, null, null, error.issues, HttpStatusCode.UNPROCESSABLE_ENTITY.message);
            }
            if (error instanceof DatabaseError) {
                return CommonResponse.error(res, error.statusCode, null, null, [error.toJSON()], error.message);
            }
            if (error instanceof Error) {
                if (error.message.startsWith('FORBIDDEN:')) {
                    return CommonResponse.error(res, HttpStatusCode.FORBIDDEN.code, null, null, [], error.message.replace('FORBIDDEN: ', ''));
                }
                if (error.message.startsWith('UNPROCESSABLE:')) {
                    return CommonResponse.error(res, HttpStatusCode.UNPROCESSABLE_ENTITY.code, null, null, [], error.message.replace('UNPROCESSABLE: ', ''));
                }
            }
            const msg = error instanceof Error ? error.message : 'Erro desconhecido';
            console.error('[HistoricoController] [getComparativo] Erro interno:', msg);
            return CommonResponse.serverError(res, { message: msg }, HttpStatusCode.INTERNAL_SERVER_ERROR.message);
        }
    }
}

export default HistoricoController;
