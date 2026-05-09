import { TreinoComExercicios } from '../repositories/treinoRepository';

export interface TreinoAlunoCreatePayload {
    nome: string;
    descricao?: string | null;
    aluno_id: string;
    dias_semana?: TreinoComExercicios['dias_semana'] | null;
    ordem?: number | null;
    exercicios?: Array<{
        exercicio_id: string;
        series: number;
        repeticoes?: string | null;
        carga_sugerida?: number | null;
        duracao_sugerida_segundos?: number | null;
        distancia_sugerida_metros?: number | null;
        tempo_descanso_segundos: number;
        ordem_execucao: number;
    }>;
}

const parseCarga = (value: string | null): number | null => {
    if (value === null) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

export function mapTreinoTemplateParaAluno(
    template: TreinoComExercicios,
    alunoId: string,
): TreinoAlunoCreatePayload {
    return {
        nome: template.nome,
        descricao: template.descricao ?? null,
        aluno_id: alunoId,
        dias_semana: template.dias_semana ?? null,
        ordem: template.ordem ?? null,
        exercicios: template.exercicios?.map((item) => ({
            exercicio_id: item.exercicio.id,
            series: item.series,
            repeticoes: item.repeticoes ?? null,
            carga_sugerida: parseCarga(item.carga_sugerida),
            duracao_sugerida_segundos: item.duracao_sugerida_segundos ?? null,
            distancia_sugerida_metros: item.distancia_sugerida_metros ?? null,
            tempo_descanso_segundos: item.tempo_descanso_segundos,
            ordem_execucao: item.ordem_execucao,
        })) ?? [],
    };
}

export function mapTreinoTemplateParaMultiplosAlunos(
    template: TreinoComExercicios,
    alunoIds: string[],
): TreinoAlunoCreatePayload[] {
    return alunoIds.map((alunoId) => mapTreinoTemplateParaAluno(template, alunoId));
}
