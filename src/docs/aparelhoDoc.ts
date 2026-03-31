import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { aparelhoQuerySchema } from "../utils/validations/aparelhoValidation";

export const aparelhoRegistry = new OpenAPIRegistry();

const idParam = z.object({
    id: z.string().uuid().openapi({ description: "UUID do aparelho", example: "550e8400-e29b-41d4-a716-446655440000" }),
});

const AparelhoResponse = z.object({
    id: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
    nome: z.string().openapi({ example: "Halter" }),
    descricao: z.string().openapi({ example: "Peso livre em formato de barra curta com anilhas nas extremidades" }),
}).openapi("Aparelho");

const AparelhoComExerciciosResponse = AparelhoResponse.extend({
    exercicios: z.array(z.object({
        exercicio_id: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440001" }),
        nome: z.string().openapi({ example: "Rosca Direta" }),
        descricao: z.string().nullable().openapi({ example: "Exercício para bíceps com halter" }),
    })).openapi({ description: "Exercícios vinculados a este aparelho (apenas não deletados)" }),
}).openapi("AparelhoComExercicios");

// GET /aparelhos
aparelhoRegistry.registerPath({
    method: "get",
    path: "/aparelhos",
    summary: "Listar aparelhos",
    description: `Lista aparelhos com paginação, filtro por nome e ordenação.

**Filtros:**
- \`nome\`: busca parcial, case e accent insensitive (ex: "halter" encontra "Halter", "halteres")

**Ordenação (\`ordem\`):**
- \`nome_asc\` (padrão): A → Z
- \`nome_desc\`: Z → A
- \`popularidade_desc\`: mais exercícios ativos vinculados primeiro`,
    tags: ["Aparelho"],
    security: [{ BearerAuth: [] }],
    request: {
        query: aparelhoQuerySchema,
    },
    responses: {
        200: {
            description: "Lista paginada de aparelhos",
            content: {
                "application/json": {
                    schema: z.object({
                        error: z.boolean().openapi({ example: false }),
                        code: z.number().openapi({ example: 200 }),
                        message: z.string().nullable(),
                        data: z.object({
                            dados: z.array(AparelhoResponse),
                            total: z.number().openapi({ example: 10 }),
                            page: z.number().openapi({ example: 1 }),
                            limite: z.number().openapi({ example: 20 }),
                            totalPages: z.number().openapi({ example: 1 }),
                        }),
                        errors: z.array(z.any()),
                    }),
                },
            },
        },
        401: { description: "Não autorizado" },
        422: { description: "Erro de validação nos query params" },
    },
});

// GET /aparelhos/{id}
aparelhoRegistry.registerPath({
    method: "get",
    path: "/aparelhos/{id}",
    summary: "Buscar aparelho por ID",
    description: "Retorna um aparelho pelo ID com a lista de exercícios ativos vinculados (via exercicio_aparelho). Exercícios com soft delete são excluídos.",
    tags: ["Aparelho"],
    security: [{ BearerAuth: [] }],
    request: {
        params: idParam,
    },
    responses: {
        200: {
            description: "Aparelho encontrado",
            content: {
                "application/json": {
                    schema: z.object({
                        error: z.boolean().openapi({ example: false }),
                        code: z.number().openapi({ example: 200 }),
                        message: z.string().nullable(),
                        data: AparelhoComExerciciosResponse,
                        errors: z.array(z.any()),
                    }),
                },
            },
        },
        401: { description: "Não autorizado" },
        404: { description: "Aparelho não encontrado" },
        422: { description: "ID inválido" },
    },
});
