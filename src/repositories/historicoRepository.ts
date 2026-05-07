import { DataBase } from '../config/DbConnect';
import { eq, and, gte, lte, inArray, asc, desc, sql } from 'drizzle-orm';
import {
    sessao_treino,
    sessao_exercicio,
    sessao_serie,
    treino,
    treino_exercicio,
    exercicio,
    exercicio_musculo,
    musculo,
    aluno,
} from '../config/db/schema';
import { parseDatabaseError } from '../utils/errors/DatabaseError';

export interface EstatisticasHistorico {
    total_sessoes: number;
    sessoes_concluidas: number;
    sessoes_canceladas: number;
    tempo_total_minutos: number;
    media_duracao_minutos: number;
    volume_total_kg: number;
    tempo_total_isometria_segundos: number;
    media_tempo_isometria_segundos: number;
    distancia_total_metros: number;
    media_distancia_metros: number;
    sequencia_atual: number;
    melhor_sequencia: number;
    treinos_por_semana_media: number;
}

export interface ProgressaoItem {
    data: Date;
    sessao_id: string;
    tipo_exercicio: 'REPETICAO' | 'TEMPO' | 'DISTANCIA';
    maior_carga: number | null;
    media_repeticoes: number | null;
    volume_total: number;
    melhor_tempo_segundos: number | null;
    media_tempo_segundos: number | null;
    tempo_total_segundos: number;
    maior_distancia_metros: number | null;
    media_distancia_metros: number | null;
    distancia_total_metros: number;
    melhor_pace_segundos_por_km: number | null;
    pace_medio_segundos_por_km: number | null;
}

export interface GrupoMuscularItem {
    grupo_muscular: string;
    total_series: number;
    volume_total_kg: number;
    tempo_total_segundos: number;
    distancia_total_metros: number;
    percentual: number;
}

export interface RecordeExercicio {
    exercicio_id: string;
    nome: string;
    tipo_exercicio: 'REPETICAO' | 'TEMPO' | 'DISTANCIA';
    total_sessoes: number;
    // REPETICAO
    maior_carga_kg: number | null;
    repeticoes_no_pr: number | null;
    data_pr_carga: Date | null;
    // TEMPO
    melhor_tempo_segundos: number | null;
    data_pr_tempo: Date | null;
    // DISTANCIA
    maior_distancia_metros: number | null;
    data_pr_distancia: Date | null;
    melhor_pace_segundos_por_km: number | null;
    data_pr_pace: Date | null;
}

export interface ExercicioFrequenteItem {
    exercicio_id: string;
    nome: string;
    tipo_exercicio: 'REPETICAO' | 'TEMPO' | 'DISTANCIA';
    total_sessoes: number;
    total_series: number;
    volume_total_kg: number;
    tempo_total_segundos: number;
    distancia_total_metros: number;
}

class HistoricoRepository {
    private db: typeof DataBase;

    constructor() {
        this.db = DataBase;
    }

    async getEstatisticas(
        alunoId: string,
        dataInicio?: string,
        dataFim?: string,
    ): Promise<EstatisticasHistorico> {
        try {
            // 1. Sessões do período
            const sessoes = await this.db
                .select({
                    id: sessao_treino.id,
                    status: sessao_treino.status,
                    inicio: sessao_treino.inicio,
                    fim: sessao_treino.fim,
                })
                .from(sessao_treino)
                .where(
                    and(
                        eq(sessao_treino.aluno_id, alunoId),
                        dataInicio ? gte(sessao_treino.inicio, new Date(dataInicio)) : undefined,
                        dataFim ? lte(sessao_treino.inicio, new Date(dataFim)) : undefined,
                    ),
                );

            const total_sessoes = sessoes.length;
            const sessoes_concluidas = sessoes.filter((s) => s.status === 'CONCLUIDA').length;
            const sessoes_canceladas = sessoes.filter((s) => s.status === 'CANCELADA').length;

            // 2. Duração (apenas sessões CONCLUIDAS com fim registrado)
            const sessoesComDuracao = sessoes.filter((s) => s.status === 'CONCLUIDA' && s.fim);
            const tempo_total_minutos = sessoesComDuracao.reduce((acc, s) => {
                return acc + Math.round((s.fim!.getTime() - s.inicio.getTime()) / 60000);
            }, 0);
            const media_duracao_minutos = sessoesComDuracao.length > 0
                ? Math.round(tempo_total_minutos / sessoesComDuracao.length)
                : 0;

            // 3. Volume total + tempo isometria + distância: séries CONCLUIDAS nas sessões do período
            const sessaoIds = sessoes.map((s) => s.id);
            let volume_total_kg = 0;
            let tempo_total_isometria_segundos = 0;
            let series_tempo_count = 0;
            let distancia_total_metros = 0;
            let series_distancia_count = 0;

            if (sessaoIds.length > 0) {
                const seriesRows = await this.db
                    .select({
                        carga_utilizada: sessao_serie.carga_utilizada,
                        repeticoes_realizadas: sessao_serie.repeticoes_realizadas,
                        tempo_realizado_segundos: sessao_serie.tempo_realizado_segundos,
                        distancia_realizada_metros: sessao_serie.distancia_realizada_metros,
                        tipo_exercicio: exercicio.tipo_exercicio,
                    })
                    .from(sessao_serie)
                    .innerJoin(sessao_exercicio, eq(sessao_serie.sessao_exercicio_id, sessao_exercicio.id))
                    .innerJoin(treino_exercicio, eq(sessao_exercicio.treino_exercicio_id, treino_exercicio.id))
                    .innerJoin(exercicio, eq(treino_exercicio.exercicio_id, exercicio.id))
                    .where(
                        and(
                            inArray(sessao_exercicio.sessao_treino_id, sessaoIds),
                            eq(sessao_serie.status, 'CONCLUIDA'),
                        ),
                    );

                for (const s of seriesRows) {
                    if (s.carga_utilizada && s.repeticoes_realizadas) {
                        volume_total_kg += parseFloat(s.carga_utilizada) * s.repeticoes_realizadas;
                    }
                    if (s.tipo_exercicio === 'TEMPO' && s.tempo_realizado_segundos) {
                        tempo_total_isometria_segundos += s.tempo_realizado_segundos;
                        series_tempo_count++;
                    }
                    if (s.tipo_exercicio === 'DISTANCIA' && s.distancia_realizada_metros) {
                        distancia_total_metros += s.distancia_realizada_metros;
                        series_distancia_count++;
                    }
                }
            }

            const media_tempo_isometria_segundos = series_tempo_count > 0
                ? Math.round(tempo_total_isometria_segundos / series_tempo_count)
                : 0;
            const media_distancia_metros = series_distancia_count > 0
                ? Math.round(distancia_total_metros / series_distancia_count)
                : 0;

            // 4. Streaks — calculados sobre TODO o histórico 
            const todasConcluidas = await this.db
                .select({ inicio: sessao_treino.inicio })
                .from(sessao_treino)
                .where(
                    and(
                        eq(sessao_treino.aluno_id, alunoId),
                        eq(sessao_treino.status, 'CONCLUIDA'),
                    ),
                )
                .orderBy(desc(sessao_treino.inicio));

            const { sequencia_atual, melhor_sequencia } = calcularSequencias(
                todasConcluidas.map((s) => s.inicio),
            );

            // 5. Treinos por semana (baseado no período filtrado)
            let treinos_por_semana_media = 0;
            if (sessoes_concluidas > 0) {
                const dataInicioEfetiva = dataInicio
                    ? new Date(dataInicio)
                    : sessoes.reduce((min, s) => (s.inicio < min ? s.inicio : min), sessoes[0].inicio);
                const dataFimEfetiva = dataFim ? new Date(dataFim) : new Date();
                const dias = Math.max(1, (dataFimEfetiva.getTime() - dataInicioEfetiva.getTime()) / (1000 * 60 * 60 * 24));
                const semanas = dias / 7;
                treinos_por_semana_media = Math.round((sessoes_concluidas / semanas) * 10) / 10;
            }

            return {
                total_sessoes,
                sessoes_concluidas,
                sessoes_canceladas,
                tempo_total_minutos,
                media_duracao_minutos,
                volume_total_kg: Math.round(volume_total_kg * 100) / 100,
                tempo_total_isometria_segundos,
                media_tempo_isometria_segundos,
                distancia_total_metros,
                media_distancia_metros,
                sequencia_atual,
                melhor_sequencia,
                treinos_por_semana_media,
            };
        } catch (error) {
            throw parseDatabaseError(error, 'HistoricoRepository.getEstatisticas');
        }
    }

    async getProgressao(
        alunoId: string,
        exercicioId: string,
        dataInicio?: string,
        dataFim?: string,
        limite: number = 50,
    ): Promise<ProgressaoItem[]> {
        try {
            const [exercicioRow] = await this.db
                .select({ tipo_exercicio: exercicio.tipo_exercicio })
                .from(exercicio)
                .where(eq(exercicio.id, exercicioId))
                .limit(1);

            const tipoExercicio = exercicioRow?.tipo_exercicio ?? 'REPETICAO';

            const rows = await this.db
                .select({
                    sessao_id: sessao_treino.id,
                    data: sessao_treino.inicio,
                    maior_carga: sql<string | null>`max(${sessao_serie.carga_utilizada})`,
                    media_repeticoes: sql<string | null>`avg(${sessao_serie.repeticoes_realizadas})`,
                    volume_total: sql<string>`coalesce(sum(
                        case
                            when ${sessao_serie.carga_utilizada} is not null
                             and ${sessao_serie.repeticoes_realizadas} is not null
                            then ${sessao_serie.carga_utilizada}::numeric * ${sessao_serie.repeticoes_realizadas}
                            else 0
                        end
                    ), 0)`,
                    melhor_tempo: sql<string | null>`max(${sessao_serie.tempo_realizado_segundos})`,
                    media_tempo: sql<string | null>`avg(${sessao_serie.tempo_realizado_segundos})`,
                    tempo_total: sql<string>`coalesce(sum(${sessao_serie.tempo_realizado_segundos}), 0)`,
                    maior_distancia: sql<string | null>`max(${sessao_serie.distancia_realizada_metros})`,
                    media_distancia: sql<string | null>`avg(${sessao_serie.distancia_realizada_metros})`,
                    distancia_total: sql<string>`coalesce(sum(${sessao_serie.distancia_realizada_metros}), 0)`,
                    melhor_pace: sql<string | null>`min(
                        case when ${sessao_serie.tempo_realizado_segundos} is not null
                              and ${sessao_serie.distancia_realizada_metros} is not null
                              and ${sessao_serie.distancia_realizada_metros} > 0
                            then (${sessao_serie.tempo_realizado_segundos}::numeric / ${sessao_serie.distancia_realizada_metros}::numeric) * 1000
                            else null
                        end
                    )`,
                    tempo_para_pace: sql<string>`coalesce(sum(
                        case when ${sessao_serie.tempo_realizado_segundos} is not null
                              and ${sessao_serie.distancia_realizada_metros} is not null
                              and ${sessao_serie.distancia_realizada_metros} > 0
                            then ${sessao_serie.tempo_realizado_segundos}
                            else 0
                        end
                    ), 0)`,
                    distancia_para_pace: sql<string>`coalesce(sum(
                        case when ${sessao_serie.tempo_realizado_segundos} is not null
                              and ${sessao_serie.distancia_realizada_metros} is not null
                              and ${sessao_serie.distancia_realizada_metros} > 0
                            then ${sessao_serie.distancia_realizada_metros}
                            else 0
                        end
                    ), 0)`,
                })
                .from(sessao_treino)
                .innerJoin(sessao_exercicio, eq(sessao_exercicio.sessao_treino_id, sessao_treino.id))
                .innerJoin(treino_exercicio, eq(sessao_exercicio.treino_exercicio_id, treino_exercicio.id))
                .innerJoin(sessao_serie, eq(sessao_serie.sessao_exercicio_id, sessao_exercicio.id))
                .where(
                    and(
                        eq(sessao_treino.aluno_id, alunoId),
                        eq(treino_exercicio.exercicio_id, exercicioId),
                        eq(sessao_treino.status, 'CONCLUIDA'),
                        eq(sessao_serie.status, 'CONCLUIDA'),
                        dataInicio ? gte(sessao_treino.inicio, new Date(dataInicio)) : undefined,
                        dataFim ? lte(sessao_treino.inicio, new Date(dataFim)) : undefined,
                    ),
                )
                .groupBy(sessao_treino.id, sessao_treino.inicio)
                .orderBy(desc(sessao_treino.inicio))
                .limit(limite);

            return rows.map((r) => {
                const tempoPace = parseInt(r.tempo_para_pace, 10);
                const distPace = parseInt(r.distancia_para_pace, 10);
                const paceMedio = distPace > 0 ? Math.round((tempoPace / distPace) * 1000) : null;

                return {
                    data: r.data,
                    sessao_id: r.sessao_id,
                    tipo_exercicio: tipoExercicio,
                    maior_carga: r.maior_carga !== null ? Math.round(parseFloat(r.maior_carga) * 100) / 100 : null,
                    media_repeticoes: r.media_repeticoes !== null ? Math.round(parseFloat(r.media_repeticoes) * 10) / 10 : null,
                    volume_total: Math.round(parseFloat(r.volume_total) * 100) / 100,
                    melhor_tempo_segundos: r.melhor_tempo !== null ? parseInt(r.melhor_tempo, 10) : null,
                    media_tempo_segundos: r.media_tempo !== null ? Math.round(parseFloat(r.media_tempo)) : null,
                    tempo_total_segundos: parseInt(r.tempo_total, 10),
                    maior_distancia_metros: r.maior_distancia !== null ? parseInt(r.maior_distancia, 10) : null,
                    media_distancia_metros: r.media_distancia !== null ? Math.round(parseFloat(r.media_distancia)) : null,
                    distancia_total_metros: parseInt(r.distancia_total, 10),
                    melhor_pace_segundos_por_km: r.melhor_pace !== null ? Math.round(parseFloat(r.melhor_pace)) : null,
                    pace_medio_segundos_por_km: paceMedio,
                };
            });
        } catch (error) {
            throw parseDatabaseError(error, 'HistoricoRepository.getProgressao');
        }
    }

    async getRecordeExercicio(alunoId: string, exercicioId: string): Promise<RecordeExercicio | null> {
        try {
            const [exRow] = await this.db
                .select({ id: exercicio.id, nome: exercicio.nome, tipo: exercicio.tipo_exercicio })
                .from(exercicio)
                .where(eq(exercicio.id, exercicioId))
                .limit(1);

            if (!exRow) return null;

            const series = await this.db
                .select({
                    sessao_id: sessao_treino.id,
                    data: sessao_treino.inicio,
                    repeticoes_realizadas: sessao_serie.repeticoes_realizadas,
                    carga_utilizada: sessao_serie.carga_utilizada,
                    tempo_realizado_segundos: sessao_serie.tempo_realizado_segundos,
                    distancia_realizada_metros: sessao_serie.distancia_realizada_metros,
                })
                .from(sessao_treino)
                .innerJoin(sessao_exercicio, eq(sessao_exercicio.sessao_treino_id, sessao_treino.id))
                .innerJoin(treino_exercicio, eq(sessao_exercicio.treino_exercicio_id, treino_exercicio.id))
                .innerJoin(sessao_serie, eq(sessao_serie.sessao_exercicio_id, sessao_exercicio.id))
                .where(
                    and(
                        eq(sessao_treino.aluno_id, alunoId),
                        eq(treino_exercicio.exercicio_id, exercicioId),
                        eq(sessao_treino.status, 'CONCLUIDA'),
                        eq(sessao_serie.status, 'CONCLUIDA'),
                    ),
                );

            const sessoesUnicas = new Set(series.map((s) => s.sessao_id)).size;

            let maior_carga_kg: number | null = null;
            let repeticoes_no_pr: number | null = null;
            let data_pr_carga: Date | null = null;
            let melhor_tempo_segundos: number | null = null;
            let data_pr_tempo: Date | null = null;
            let maior_distancia_metros: number | null = null;
            let data_pr_distancia: Date | null = null;
            let melhor_pace_segundos_por_km: number | null = null;
            let data_pr_pace: Date | null = null;

            for (const s of series) {
                if (s.carga_utilizada !== null) {
                    const carga = parseFloat(s.carga_utilizada);
                    if (maior_carga_kg === null || carga > maior_carga_kg) {
                        maior_carga_kg = carga;
                        repeticoes_no_pr = s.repeticoes_realizadas;
                        data_pr_carga = s.data;
                    }
                }
                if (s.tempo_realizado_segundos !== null && s.distancia_realizada_metros === null) {
                    if (melhor_tempo_segundos === null || s.tempo_realizado_segundos > melhor_tempo_segundos) {
                        melhor_tempo_segundos = s.tempo_realizado_segundos;
                        data_pr_tempo = s.data;
                    }
                }
                if (s.distancia_realizada_metros !== null) {
                    if (maior_distancia_metros === null || s.distancia_realizada_metros > maior_distancia_metros) {
                        maior_distancia_metros = s.distancia_realizada_metros;
                        data_pr_distancia = s.data;
                    }
                    if (s.tempo_realizado_segundos !== null && s.distancia_realizada_metros > 0) {
                        const pace = Math.round((s.tempo_realizado_segundos / s.distancia_realizada_metros) * 1000);
                        if (melhor_pace_segundos_por_km === null || pace < melhor_pace_segundos_por_km) {
                            melhor_pace_segundos_por_km = pace;
                            data_pr_pace = s.data;
                        }
                    }
                }
            }

            return {
                exercicio_id: exRow.id,
                nome: exRow.nome,
                tipo_exercicio: exRow.tipo,
                total_sessoes: sessoesUnicas,
                maior_carga_kg: maior_carga_kg !== null ? Math.round(maior_carga_kg * 100) / 100 : null,
                repeticoes_no_pr,
                data_pr_carga,
                melhor_tempo_segundos,
                data_pr_tempo,
                maior_distancia_metros,
                data_pr_distancia,
                melhor_pace_segundos_por_km,
                data_pr_pace,
            };
        } catch (error) {
            throw parseDatabaseError(error, 'HistoricoRepository.getRecordeExercicio');
        }
    }

    async buscarAlunosDoTreinador(treinadorId: string): Promise<string[]> {
        try {
            const rows = await this.db
                .select({ aluno_id: aluno.id })
                .from(aluno)
                .where(eq(aluno.treinador_id, treinadorId));

            return [...new Set(rows.map((r) => r.aluno_id))];
        } catch (error) {
            throw parseDatabaseError(error, 'HistoricoRepository.buscarAlunosDoTreinador');
        }
    }

    async getGruposMusculares(
        alunoId: string,
        dataInicio?: string,
        dataFim?: string,
    ): Promise<GrupoMuscularItem[]> {
        try {
            const rows = await this.db
                .select({
                    grupo_muscular: musculo.grupo_muscular,
                    total_series: sql<string>`count(${sessao_serie.id})`,
                    volume_total_kg: sql<string>`coalesce(sum(
                        case
                            when ${sessao_serie.carga_utilizada} is not null
                             and ${sessao_serie.repeticoes_realizadas} is not null
                            then ${sessao_serie.carga_utilizada}::numeric * ${sessao_serie.repeticoes_realizadas}
                            else 0
                        end
                    ), 0)`,
                    tempo_total_segundos: sql<string>`coalesce(sum(
                        case when ${exercicio.tipo_exercicio} = 'TEMPO' then ${sessao_serie.tempo_realizado_segundos} else 0 end
                    ), 0)`,
                    distancia_total_metros: sql<string>`coalesce(sum(
                        case when ${exercicio.tipo_exercicio} = 'DISTANCIA' then ${sessao_serie.distancia_realizada_metros} else 0 end
                    ), 0)`,
                })
                .from(sessao_treino)
                .innerJoin(sessao_exercicio, eq(sessao_exercicio.sessao_treino_id, sessao_treino.id))
                .innerJoin(treino_exercicio, eq(sessao_exercicio.treino_exercicio_id, treino_exercicio.id))
                .innerJoin(exercicio, eq(treino_exercicio.exercicio_id, exercicio.id))
                .innerJoin(exercicio_musculo, eq(exercicio_musculo.exercicio_id, exercicio.id))
                .innerJoin(musculo, eq(exercicio_musculo.musculo_id, musculo.id))
                .innerJoin(sessao_serie, eq(sessao_serie.sessao_exercicio_id, sessao_exercicio.id))
                .where(
                    and(
                        eq(sessao_treino.aluno_id, alunoId),
                        eq(sessao_treino.status, 'CONCLUIDA'),
                        eq(sessao_serie.status, 'CONCLUIDA'),
                        dataInicio ? gte(sessao_treino.inicio, new Date(dataInicio)) : undefined,
                        dataFim ? lte(sessao_treino.inicio, new Date(dataFim)) : undefined,
                    ),
                )
                .groupBy(musculo.grupo_muscular)
                .orderBy(desc(sql`count(${sessao_serie.id})`), asc(musculo.grupo_muscular));

            const totalSeries = rows.reduce((acc, r) => acc + Number(r.total_series), 0);

            return rows.map((r) => ({
                grupo_muscular: r.grupo_muscular,
                total_series: Number(r.total_series),
                volume_total_kg: Math.round(parseFloat(r.volume_total_kg) * 100) / 100,
                tempo_total_segundos: parseInt(r.tempo_total_segundos, 10),
                distancia_total_metros: parseInt(r.distancia_total_metros, 10),
                percentual: totalSeries > 0 ? Math.round((Number(r.total_series) / totalSeries) * 1000) / 10 : 0,
            }));
        } catch (error) {
            throw parseDatabaseError(error, 'HistoricoRepository.getGruposMusculares');
        }
    }

    async getExerciciosFrequentes(
        alunoId: string,
        dataInicio?: string,
        dataFim?: string,
        limite: number = 10,
        tipoExercicio?: 'REPETICAO' | 'TEMPO' | 'DISTANCIA',
    ): Promise<ExercicioFrequenteItem[]> {
        try {
            const rows = await this.db
                .select({
                    exercicio_id: exercicio.id,
                    nome: exercicio.nome,
                    tipo_exercicio: exercicio.tipo_exercicio,
                    total_sessoes: sql<string>`count(distinct ${sessao_treino.id})`,
                    total_series: sql<string>`count(${sessao_serie.id})`,
                    volume_total_kg: sql<string>`coalesce(sum(
                        case
                            when ${sessao_serie.carga_utilizada} is not null
                             and ${sessao_serie.repeticoes_realizadas} is not null
                            then ${sessao_serie.carga_utilizada}::numeric * ${sessao_serie.repeticoes_realizadas}
                            else 0
                        end
                    ), 0)`,
                    tempo_total_segundos: sql<string>`coalesce(sum(${sessao_serie.tempo_realizado_segundos}), 0)`,
                    distancia_total_metros: sql<string>`coalesce(sum(${sessao_serie.distancia_realizada_metros}), 0)`,
                })
                .from(sessao_treino)
                .innerJoin(sessao_exercicio, eq(sessao_exercicio.sessao_treino_id, sessao_treino.id))
                .innerJoin(treino_exercicio, eq(sessao_exercicio.treino_exercicio_id, treino_exercicio.id))
                .innerJoin(exercicio, eq(treino_exercicio.exercicio_id, exercicio.id))
                .innerJoin(sessao_serie, eq(sessao_serie.sessao_exercicio_id, sessao_exercicio.id))
                .where(
                    and(
                        eq(sessao_treino.aluno_id, alunoId),
                        eq(sessao_treino.status, 'CONCLUIDA'),
                        eq(sessao_serie.status, 'CONCLUIDA'),
                        dataInicio ? gte(sessao_treino.inicio, new Date(dataInicio)) : undefined,
                        dataFim ? lte(sessao_treino.inicio, new Date(dataFim)) : undefined,
                        tipoExercicio ? eq(exercicio.tipo_exercicio, tipoExercicio) : undefined,
                    ),
                )
                .groupBy(exercicio.id, exercicio.nome, exercicio.tipo_exercicio)
                .orderBy(desc(sql`count(distinct ${sessao_treino.id})`), asc(exercicio.nome))
                .limit(limite);

            return rows.map((r) => ({
                exercicio_id: r.exercicio_id,
                nome: r.nome,
                tipo_exercicio: r.tipo_exercicio,
                total_sessoes: Number(r.total_sessoes),
                total_series: Number(r.total_series),
                volume_total_kg: Math.round(parseFloat(r.volume_total_kg) * 100) / 100,
                tempo_total_segundos: parseInt(r.tempo_total_segundos, 10),
                distancia_total_metros: parseInt(r.distancia_total_metros, 10),
            }));
        } catch (error) {
            throw parseDatabaseError(error, 'HistoricoRepository.getExerciciosFrequentes');
        }
    }
}

/**
 * Calcula sequencia_atual e melhor_sequencia a partir de um array de datas de sessões.
 * - sequencia_atual: dias consecutivos a partir de hoje ou ontem
 * - melhor_sequencia: maior streak histórico
 */
function calcularSequencias(datas: Date[]): { sequencia_atual: number; melhor_sequencia: number } {
    if (datas.length === 0) return { sequencia_atual: 0, melhor_sequencia: 0 };

    const diasUnicos = [...new Set(datas.map((d) => d.toISOString().slice(0, 10)))].sort();

    // Melhor sequência histórica
    let melhor = 1;
    let contagem = 1;
    for (let i = 1; i < diasUnicos.length; i++) {
        const prev = new Date(diasUnicos[i - 1]);
        const curr = new Date(diasUnicos[i]);
        const diffDias = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDias === 1) {
            contagem++;
            if (contagem > melhor) melhor = contagem;
        } else {
            contagem = 1;
        }
    }

    // Sequência atual: verifica se o último treino foi hoje ou ontem
    const hoje = new Date().toISOString().slice(0, 10);
    const ontem = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const ultimoDia = diasUnicos[diasUnicos.length - 1];

    if (ultimoDia !== hoje && ultimoDia !== ontem) {
        return { sequencia_atual: 0, melhor_sequencia: melhor };
    }

    let sequencia_atual = 1;
    for (let i = diasUnicos.length - 2; i >= 0; i--) {
        const curr = new Date(diasUnicos[i + 1]);
        const prev = new Date(diasUnicos[i]);
        const diffDias = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDias === 1) {
            sequencia_atual++;
        } else {
            break;
        }
    }

    return { sequencia_atual, melhor_sequencia: melhor };
}

export default HistoricoRepository;
