import { z } from 'zod';
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

const historicoEstatisticasQuerySchema = z.object({
    aluno_id: z
        .string()
        .uuid({ message: 'aluno_id deve ser um UUID válido' })
        .optional()
        .openapi({ description: 'Filtra por aluno (obrigatório para admin e treinador)', example: '550e8400-e29b-41d4-a716-446655440001' }),
    data_inicio: z
        .string()
        .datetime({ message: 'data_inicio deve ser uma data ISO 8601 válida' })
        .optional()
        .openapi({ description: 'Início do período (ISO 8601)', example: '2026-01-01T00:00:00.000Z' }),
    data_fim: z
        .string()
        .datetime({ message: 'data_fim deve ser uma data ISO 8601 válida' })
        .optional()
        .openapi({ description: 'Fim do período (ISO 8601)', example: '2026-03-31T23:59:59.999Z' }),
}).strict().openapi('HistoricoEstatisticasQuery');

const historicoProgressaoQuerySchema = z.object({
    aluno_id: z
        .string()
        .uuid({ message: 'aluno_id deve ser um UUID válido' })
        .optional()
        .openapi({ description: 'Filtra por aluno (obrigatório para admin e treinador)', example: '550e8400-e29b-41d4-a716-446655440001' }),
    data_inicio: z
        .string()
        .datetime({ message: 'data_inicio deve ser uma data ISO 8601 válida' })
        .optional()
        .openapi({ description: 'Início do período (ISO 8601)', example: '2026-01-01T00:00:00.000Z' }),
    data_fim: z
        .string()
        .datetime({ message: 'data_fim deve ser uma data ISO 8601 válida' })
        .optional()
        .openapi({ description: 'Fim do período (ISO 8601)', example: '2026-03-31T23:59:59.999Z' }),
    limite: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 50))
        .refine((val) => Number.isInteger(val) && val > 0 && val <= 100, { message: 'limite deve ser entre 1 e 100' })
        .openapi({ description: 'Máximo de sessões retornadas (padrão: 50, máx: 100)', example: '50' }),
}).strict().openapi('HistoricoProgressaoQuery');

const historicoExercicioIdSchema = z
    .string()
    .uuid('exercicioId inválido, deve ser um UUID válido')
    .openapi({ description: 'UUID do exercício', example: '550e8400-e29b-41d4-a716-446655440003' });

const historicoGruposMuscularesQuerySchema = z.object({
    aluno_id: z
        .string()
        .uuid({ message: 'aluno_id deve ser um UUID válido' })
        .optional()
        .openapi({ description: 'Filtra por aluno (obrigatório para admin e treinador)', example: '550e8400-e29b-41d4-a716-446655440001' }),
    data_inicio: z
        .string()
        .datetime({ message: 'data_inicio deve ser uma data ISO 8601 válida' })
        .optional()
        .openapi({ description: 'Início do período (ISO 8601)', example: '2026-01-01T00:00:00.000Z' }),
    data_fim: z
        .string()
        .datetime({ message: 'data_fim deve ser uma data ISO 8601 válida' })
        .optional()
        .openapi({ description: 'Fim do período (ISO 8601)', example: '2026-03-31T23:59:59.999Z' }),
}).strict().openapi('HistoricoGruposMuscularesQuery');

const historicoExerciciosFrequentesQuerySchema = z.object({
    aluno_id: z
        .string()
        .uuid({ message: 'aluno_id deve ser um UUID válido' })
        .optional()
        .openapi({ description: 'Filtra por aluno (obrigatório para admin e treinador)', example: '550e8400-e29b-41d4-a716-446655440001' }),
    data_inicio: z
        .string()
        .datetime({ message: 'data_inicio deve ser uma data ISO 8601 válida' })
        .optional()
        .openapi({ description: 'Início do período (ISO 8601)', example: '2026-01-01T00:00:00.000Z' }),
    data_fim: z
        .string()
        .datetime({ message: 'data_fim deve ser uma data ISO 8601 válida' })
        .optional()
        .openapi({ description: 'Fim do período (ISO 8601)', example: '2026-03-31T23:59:59.999Z' }),
    limite: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 10))
        .refine((val) => Number.isInteger(val) && val > 0 && val <= 50, { message: 'limite deve ser entre 1 e 50' })
        .openapi({ description: 'Máximo de exercícios retornados (padrão: 10, máx: 50)', example: '10' }),
    tipo_exercicio: z
        .enum(['REPETICAO', 'TEMPO', 'DISTANCIA'])
        .optional()
        .openapi({ description: 'Filtra apenas exercícios deste tipo de medição', example: 'TEMPO' }),
}).strict().openapi('HistoricoExerciciosFrequentesQuery');

const historicoRecordeQuerySchema = z.object({
    aluno_id: z
        .string()
        .uuid({ message: 'aluno_id deve ser um UUID válido' })
        .optional()
        .openapi({ description: 'Filtra por aluno (obrigatório para admin e treinador)', example: '550e8400-e29b-41d4-a716-446655440001' }),
}).strict().openapi('HistoricoRecordeQuery');

type HistoricoRecordeQuery = z.infer<typeof historicoRecordeQuerySchema>;

const historicoComparativoQuerySchema = z.object({
    aluno_id: z
        .string()
        .uuid({ message: 'aluno_id deve ser um UUID válido' })
        .optional()
        .openapi({ description: 'Filtra por aluno (obrigatório para admin e treinador)', example: '550e8400-e29b-41d4-a716-446655440001' }),
    semanas: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 4))
        .refine((val) => Number.isInteger(val) && val >= 1 && val <= 52, { message: 'semanas deve ser entre 1 e 52' })
        .openapi({ description: 'Número de semanas de cada período comparado (padrão: 4)', example: '4' }),
}).strict().openapi('HistoricoComparativoQuery');

type HistoricoEstatisticasQuery = z.infer<typeof historicoEstatisticasQuerySchema>;
type HistoricoProgressaoQuery = z.infer<typeof historicoProgressaoQuerySchema>;
type HistoricoGruposMuscularesQuery = z.infer<typeof historicoGruposMuscularesQuerySchema>;
type HistoricoExerciciosFrequentesQuery = z.infer<typeof historicoExerciciosFrequentesQuerySchema>;
type HistoricoComparativoQuery = z.infer<typeof historicoComparativoQuerySchema>;

export {
    historicoEstatisticasQuerySchema,
    historicoProgressaoQuerySchema,
    historicoExercicioIdSchema,
    historicoGruposMuscularesQuerySchema,
    historicoExerciciosFrequentesQuerySchema,
    historicoRecordeQuerySchema,
    historicoComparativoQuerySchema,
};
export type {
    HistoricoEstatisticasQuery,
    HistoricoProgressaoQuery,
    HistoricoGruposMuscularesQuery,
    HistoricoExerciciosFrequentesQuery,
    HistoricoRecordeQuery,
    HistoricoComparativoQuery,
};
