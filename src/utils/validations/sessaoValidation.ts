import { z } from 'zod';
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

const sessaoSchema = z.object({
    treino_id: z
        .string()
        .uuid({ message: "O ID do treino deve ser um UUID válido" })
        .openapi({ description: "UUID do treino a ser iniciado", example: "550e8400-e29b-41d4-a716-446655440000" }),
}).strict().openapi("SessaoInput");

const sessaoIdSchema = z
    .string()
    .uuid('ID inválido, deve ser um UUID válido')
    .openapi({ description: "UUID da sessão", example: "550e8400-e29b-41d4-a716-446655440000" });

const sessaoListQuerySchema = z.object({
    aluno_id: z
        .string()
        .uuid({ message: 'aluno_id deve ser um UUID válido' })
        .optional()
        .openapi({ description: 'Filtra sessões por aluno', example: '550e8400-e29b-41d4-a716-446655440001' }),
    treino_id: z
        .string()
        .uuid({ message: 'treino_id deve ser um UUID válido' })
        .optional()
        .openapi({ description: 'Filtra sessões por treino', example: '550e8400-e29b-41d4-a716-446655440004' }),
    status: z
        .enum(['EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA'])
        .optional()
        .openapi({ description: 'Filtra sessões por status', example: 'CONCLUIDA' }),
    data_inicio: z
        .string()
        .datetime({ message: 'data_inicio deve ser uma data ISO 8601 válida' })
        .optional()
        .openapi({ description: 'Filtra sessões iniciadas a partir desta data (ISO 8601)', example: '2026-03-01T00:00:00.000Z' }),
    data_fim: z
        .string()
        .datetime({ message: 'data_fim deve ser uma data ISO 8601 válida' })
        .optional()
        .openapi({ description: 'Filtra sessões iniciadas até esta data (ISO 8601)', example: '2026-03-31T23:59:59.999Z' }),
    page: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 1))
        .refine((val) => Number.isInteger(val) && val > 0, { message: 'page deve ser um número inteiro maior que 0' })
        .openapi({ description: 'Número da página', example: '1' }),
    limite: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 10))
        .refine((val) => Number.isInteger(val) && val > 0 && val <= 100, { message: 'limite deve ser entre 1 e 100' })
        .openapi({ description: 'Limite de itens por página', example: '10' }),
    ordem_data_inicio: z
        .enum(['asc', 'desc'])
        .default('desc')
        .openapi({ description: 'Ordena por data de início da sessão', example: 'desc' }),
}).strict().openapi('SessaoListQuery');

type SessaoListQuery = z.infer<typeof sessaoListQuerySchema>;

export { sessaoSchema, sessaoIdSchema, sessaoListQuerySchema };
export type { SessaoListQuery };
