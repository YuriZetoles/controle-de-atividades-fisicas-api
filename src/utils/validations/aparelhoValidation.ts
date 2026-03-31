import { z } from 'zod';
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

const aparelhoQuerySchema = z.object({
    nome: z
        .string()
        .optional()
        .openapi({ description: "Filtrar por nome do aparelho (busca parcial, case e accent insensitive via unaccent)", example: "halter" }),
    ordem: z
        .enum(['nome_asc', 'nome_desc', 'popularidade_desc'])
        .default('nome_asc')
        .openapi({
            description: "Ordenação: nome_asc (A→Z), nome_desc (Z→A), popularidade_desc (mais exercícios ativos vinculados primeiro)",
            example: "nome_asc",
        }),
    page: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 1))
        .refine((val) => Number.isInteger(val) && val > 0, {
            message: 'page deve ser um número inteiro maior que 0',
        })
        .openapi({ description: "Número da página", example: "1" }),
    limite: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 20))
        .refine((val) => Number.isInteger(val) && val > 0 && val <= 100, {
            message: 'limite deve ser entre 1 e 100',
        })
        .openapi({ description: "Limite de resultados por página (máx. 100)", example: "20" }),
}).strict().openapi("AparelhoQuery");

const aparelhoIdSchema = z
    .string()
    .uuid('ID inválido, deve ser um UUID válido')
    .openapi({ description: "UUID do aparelho", example: "550e8400-e29b-41d4-a716-446655440000" });

export { aparelhoQuerySchema, aparelhoIdSchema };
