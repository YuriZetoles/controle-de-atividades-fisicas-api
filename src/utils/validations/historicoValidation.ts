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

type HistoricoEstatisticasQuery = z.infer<typeof historicoEstatisticasQuerySchema>;
type HistoricoProgressaoQuery = z.infer<typeof historicoProgressaoQuerySchema>;

export { historicoEstatisticasQuerySchema, historicoProgressaoQuerySchema, historicoExercicioIdSchema };
export type { HistoricoEstatisticasQuery, HistoricoProgressaoQuery };
