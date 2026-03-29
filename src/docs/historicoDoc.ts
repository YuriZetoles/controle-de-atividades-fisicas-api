import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

export const historicoRegistry = new OpenAPIRegistry();

const EstatisticasResponse = z.object({
    total_sessoes: z.number().openapi({ example: 24 }),
    sessoes_concluidas: z.number().openapi({ example: 20 }),
    sessoes_canceladas: z.number().openapi({ example: 2 }),
    tempo_total_minutos: z.number().openapi({ example: 1320 }),
    media_duracao_minutos: z.number().openapi({ example: 66 }),
    volume_total_kg: z.number().openapi({ example: 48250.75 }),
    sequencia_atual: z.number().openapi({ example: 5 }),
    melhor_sequencia: z.number().openapi({ example: 12 }),
    treinos_por_semana_media: z.number().openapi({ example: 3.5 }),
}).openapi("HistoricoEstatisticas");

const ProgressaoItemResponse = z.object({
    data: z.coerce.date().openapi({ example: "2026-03-27T10:00:00.000Z" }),
    sessao_id: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
    maior_carga: z.number().nullable().openapi({ example: 100.0 }),
    media_repeticoes: z.number().nullable().openapi({ example: 10.5 }),
    volume_total: z.number().openapi({ example: 1260.0 }),
}).openapi("ProgressaoItem");

// GET /historico/estatisticas
historicoRegistry.registerPath({
    method: "get",
    path: "/historico/estatisticas",
    summary: "Estatísticas agregadas do histórico de treinos",
    description: `Retorna métricas agregadas das sessões de treino concluídas.

**Campos:**
- \`total_sessoes\`: total de sessões no período (qualquer status)
- \`sessoes_concluidas\` / \`sessoes_canceladas\`: por status
- \`tempo_total_minutos\`: soma das durações das sessões CONCLUIDAS com fim registrado
- \`media_duracao_minutos\`: média das durações
- \`volume_total_kg\`: soma de \`carga_utilizada × repeticoes_realizadas\` das séries CONCLUIDAS
- \`sequencia_atual\`: dias consecutivos com ao menos 1 sessão CONCLUIDA até hoje ou ontem
- \`melhor_sequencia\`: maior streak histórico de dias consecutivos
- \`treinos_por_semana_media\`: \`sessoes_concluidas / semanas_no_período\`

**Nota:** \`sequencia_atual\` e \`melhor_sequencia\` são calculadas sobre **todo o histórico** do aluno, independente do filtro de período — streak é uma métrica contínua.

**Controle de acesso:**
- **Aluno**: vê o próprio histórico (\`aluno_id\` ignorado ou deve ser o próprio)
- **Treinador**: \`aluno_id\` obrigatório, deve ser aluno com treino vinculado ao treinador
- **Admin**: \`aluno_id\` obrigatório`,
    tags: ["Historico"],
    security: [{ BearerAuth: [] }],
    request: {
        query: z.object({
            aluno_id: z.string().uuid().optional().openapi({ example: "550e8400-e29b-41d4-a716-446655440001", description: "Filtra por aluno (obrigatório para admin e treinador)" }),
            data_inicio: z.string().optional().openapi({ example: "2026-01-01T00:00:00.000Z", description: "Início do período (ISO 8601)" }),
            data_fim: z.string().optional().openapi({ example: "2026-03-31T23:59:59.999Z", description: "Fim do período (ISO 8601)" }),
        }),
    },
    responses: {
        200: {
            description: "Estatísticas calculadas com sucesso",
            content: {
                "application/json": {
                    schema: z.object({
                        error: z.boolean().openapi({ example: false }),
                        code: z.number().openapi({ example: 200 }),
                        message: z.string().nullable().openapi({ example: null }),
                        data: EstatisticasResponse,
                        errors: z.array(z.any()),
                    }),
                },
            },
        },
        401: { description: "Não autorizado" },
        403: { description: "Sem permissão para visualizar este histórico" },
        422: { description: "aluno_id obrigatório para admin/treinador / erro de validação" },
    },
});

// GET /historico/progressao/:exercicioId
historicoRegistry.registerPath({
    method: "get",
    path: "/historico/progressao/{exercicioId}",
    summary: "Progressão de um exercício ao longo do tempo",
    description: `Retorna uma série temporal de sessões CONCLUIDAS em que o exercício foi realizado, ordenada da mais recente para a mais antiga.

Cada item representa uma sessão e traz os valores das séries CONCLUIDAS daquele exercício:
- \`maior_carga\`: maior carga utilizada na sessão (kg)
- \`media_repeticoes\`: média de repetições realizadas
- \`volume_total\`: soma de \`carga × repetições\` das séries CONCLUIDAS

**Uso no app:** alimente um gráfico de evolução (eixo X = data, eixo Y = maior_carga ou volume_total). O PR do exercício é o \`max(maior_carga)\` do array retornado.

**Controle de acesso:** mesmo modelo de \`/historico/estatisticas\`.`,
    tags: ["Historico"],
    security: [{ BearerAuth: [] }],
    request: {
        params: z.object({
            exercicioId: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440003" }),
        }),
        query: z.object({
            aluno_id: z.string().uuid().optional().openapi({ example: "550e8400-e29b-41d4-a716-446655440001", description: "Filtra por aluno (obrigatório para admin e treinador)" }),
            data_inicio: z.string().optional().openapi({ example: "2026-01-01T00:00:00.000Z", description: "Início do período (ISO 8601)" }),
            data_fim: z.string().optional().openapi({ example: "2026-03-31T23:59:59.999Z", description: "Fim do período (ISO 8601)" }),
            limite: z.string().optional().openapi({ example: "50", description: "Máximo de sessões retornadas (padrão: 50, máx: 100)" }),
        }),
    },
    responses: {
        200: {
            description: "Série temporal de progressão do exercício",
            content: {
                "application/json": {
                    schema: z.object({
                        error: z.boolean().openapi({ example: false }),
                        code: z.number().openapi({ example: 200 }),
                        message: z.string().nullable().openapi({ example: null }),
                        data: z.array(ProgressaoItemResponse),
                        errors: z.array(z.any()),
                    }),
                },
            },
        },
        401: { description: "Não autorizado" },
        403: { description: "Sem permissão para visualizar este histórico" },
        422: { description: "exercicioId inválido / aluno_id obrigatório para admin/treinador / erro de validação" },
    },
});

const GrupoMuscularItemResponse = z.object({
    grupo_muscular: z.string().openapi({ example: "PEITO" }),
    total_series: z.number().openapi({ example: 48 }),
    volume_total_kg: z.number().openapi({ example: 5760.0 }),
    percentual: z.number().openapi({ example: 22.5 }),
}).openapi("GrupoMuscularItem");

const ExercicioFrequenteItemResponse = z.object({
    exercicio_id: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440003" }),
    nome: z.string().openapi({ example: "Supino Reto" }),
    total_sessoes: z.number().openapi({ example: 12 }),
    total_series: z.number().openapi({ example: 48 }),
    volume_total_kg: z.number().openapi({ example: 5760.0 }),
}).openapi("ExercicioFrequenteItem");

const PeriodoComparativoResponse = EstatisticasResponse.omit({
    sequencia_atual: true,
    melhor_sequencia: true,
}).openapi("PeriodoComparativo");

const ComparativoResponse = z.object({
    periodo_atual_inicio: z.string().openapi({ example: "2026-02-27T00:00:00.000Z" }),
    periodo_atual_fim: z.string().openapi({ example: "2026-03-27T00:00:00.000Z" }),
    periodo_anterior_inicio: z.string().openapi({ example: "2026-01-28T00:00:00.000Z" }),
    periodo_anterior_fim: z.string().openapi({ example: "2026-02-27T00:00:00.000Z" }),
    periodo_atual: PeriodoComparativoResponse,
    periodo_anterior: PeriodoComparativoResponse,
    variacao: z.object({
        sessoes_concluidas_pct: z.number().nullable().openapi({ example: 25.0 }),
        sessoes_concluidas_abs: z.number().openapi({ example: 2 }),
        volume_total_kg_pct: z.number().nullable().openapi({ example: 12.5 }),
        volume_total_kg_abs: z.number().openapi({ example: 1680.0 }),
        media_duracao_minutos_pct: z.number().nullable().openapi({ example: -5.0 }),
        media_duracao_minutos_abs: z.number().openapi({ example: -3 }),
        treinos_por_semana_pct: z.number().nullable().openapi({ example: 33.3 }),
        treinos_por_semana_abs: z.number().openapi({ example: 0.8 }),
    }),
}).openapi("HistoricoComparativo");

// GET /historico/grupos-musculares
historicoRegistry.registerPath({
    method: "get",
    path: "/historico/grupos-musculares",
    summary: "Distribuição de séries por grupo muscular",
    description: `Retorna quantas séries CONCLUIDAS o aluno realizou por grupo muscular no período, com volume e percentual de cada grupo.

**Importante:** exercícios que ativam múltiplos grupos musculares (ex: Supino Reto → PEITO + BRAÇOS) contam uma série para cada grupo. Por isso, a soma de \`total_series\` de todos os grupos pode exceder o total real de séries realizadas. Use \`percentual\` para proporção relativa entre grupos, não como fração do total absoluto.

**Ordenação:** total de séries desc, grupo_muscular asc em caso de empate.

Exercícios sem músculos cadastrados não aparecem.

**Controle de acesso:** mesmo modelo de \`/historico/estatisticas\`.`,
    tags: ["Historico"],
    security: [{ BearerAuth: [] }],
    request: {
        query: z.object({
            aluno_id: z.string().uuid().optional().openapi({ example: "550e8400-e29b-41d4-a716-446655440001", description: "Filtra por aluno (obrigatório para admin e treinador)" }),
            data_inicio: z.string().optional().openapi({ example: "2026-01-01T00:00:00.000Z", description: "Início do período (ISO 8601)" }),
            data_fim: z.string().optional().openapi({ example: "2026-03-31T23:59:59.999Z", description: "Fim do período (ISO 8601)" }),
        }),
    },
    responses: {
        200: {
            description: "Distribuição por grupo muscular",
            content: {
                "application/json": {
                    schema: z.object({
                        error: z.boolean().openapi({ example: false }),
                        code: z.number().openapi({ example: 200 }),
                        message: z.string().nullable().openapi({ example: null }),
                        data: z.array(GrupoMuscularItemResponse),
                        errors: z.array(z.any()),
                    }),
                },
            },
        },
        401: { description: "Não autorizado" },
        403: { description: "Sem permissão para visualizar este histórico" },
        422: { description: "aluno_id obrigatório para admin/treinador / erro de validação" },
    },
});

// GET /historico/exercicios-frequentes
historicoRegistry.registerPath({
    method: "get",
    path: "/historico/exercicios-frequentes",
    summary: "Exercícios mais treinados no período",
    description: `Retorna os exercícios que o aluno mais realizou em sessões CONCLUIDAS, ordenados por número de sessões.

Útil para: seção "seus exercícios favoritos" no perfil do aluno.

**Controle de acesso:** mesmo modelo de \`/historico/estatisticas\`.`,
    tags: ["Historico"],
    security: [{ BearerAuth: [] }],
    request: {
        query: z.object({
            aluno_id: z.string().uuid().optional().openapi({ example: "550e8400-e29b-41d4-a716-446655440001", description: "Filtra por aluno (obrigatório para admin e treinador)" }),
            data_inicio: z.string().optional().openapi({ example: "2026-01-01T00:00:00.000Z", description: "Início do período (ISO 8601)" }),
            data_fim: z.string().optional().openapi({ example: "2026-03-31T23:59:59.999Z", description: "Fim do período (ISO 8601)" }),
            limite: z.string().optional().openapi({ example: "10", description: "Máximo de exercícios retornados (padrão: 10, máx: 50)" }),
        }),
    },
    responses: {
        200: {
            description: "Exercícios mais frequentes",
            content: {
                "application/json": {
                    schema: z.object({
                        error: z.boolean().openapi({ example: false }),
                        code: z.number().openapi({ example: 200 }),
                        message: z.string().nullable().openapi({ example: null }),
                        data: z.array(ExercicioFrequenteItemResponse),
                        errors: z.array(z.any()),
                    }),
                },
            },
        },
        401: { description: "Não autorizado" },
        403: { description: "Sem permissão para visualizar este histórico" },
        422: { description: "aluno_id obrigatório para admin/treinador / erro de validação" },
    },
});

// GET /historico/comparativo
historicoRegistry.registerPath({
    method: "get",
    path: "/historico/comparativo",
    summary: "Comparativo entre período atual e período anterior",
    description: `Compara as estatísticas do período atual (últimas N semanas) com o período imediatamente anterior (N semanas antes disso).

Os campos \`periodo_atual_inicio/fim\` e \`periodo_anterior_inicio/fim\` retornam as datas exatas de cada janela para exibição de legenda na UI.

**Campos de variação** (inclui percentual e absoluto):
- Valor positivo = melhora (ex: +25% = treinou 25% mais, +2 = 2 sessões a mais)
- Valor negativo = queda
- \`*_pct = null\` = período anterior sem dados (divisão por zero evitada)

**Nota:** \`sequencia_atual\` e \`melhor_sequencia\` são omitidas de \`periodo_atual\` e \`periodo_anterior\` — streak é uma métrica global e não faz sentido segmentada por janela de tempo. Consulte \`GET /historico/estatisticas\` para obter streaks.

**Exemplo com semanas=4:**
- Período atual: últimas 4 semanas
- Período anterior: 4 semanas antes disso (semanas 5 a 8 atrás)

**Controle de acesso:** mesmo modelo de \`/historico/estatisticas\`.`,
    tags: ["Historico"],
    security: [{ BearerAuth: [] }],
    request: {
        query: z.object({
            aluno_id: z.string().uuid().optional().openapi({ example: "550e8400-e29b-41d4-a716-446655440001", description: "Filtra por aluno (obrigatório para admin e treinador)" }),
            semanas: z.string().optional().openapi({ example: "4", description: "Número de semanas de cada período (padrão: 4, máx: 52)" }),
        }),
    },
    responses: {
        200: {
            description: "Comparativo entre períodos",
            content: {
                "application/json": {
                    schema: z.object({
                        error: z.boolean().openapi({ example: false }),
                        code: z.number().openapi({ example: 200 }),
                        message: z.string().nullable().openapi({ example: null }),
                        data: ComparativoResponse,
                        errors: z.array(z.any()),
                    }),
                },
            },
        },
        401: { description: "Não autorizado" },
        403: { description: "Sem permissão para visualizar este histórico" },
        422: { description: "aluno_id obrigatório para admin/treinador / erro de validação" },
    },
});
