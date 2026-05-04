import HistoricoRepository, { EstatisticasHistorico, ProgressaoItem, GrupoMuscularItem, ExercicioFrequenteItem } from '../repositories/historicoRepository';
import UsuarioRepository from '../repositories/usuarioRepository';
import {
    historicoEstatisticasQuerySchema,
    historicoProgressaoQuerySchema,
    historicoExercicioIdSchema,
    historicoGruposMuscularesQuerySchema,
    historicoExerciciosFrequentesQuerySchema,
    historicoComparativoQuerySchema,
    HistoricoEstatisticasQuery,
    HistoricoProgressaoQuery,
    HistoricoGruposMuscularesQuery,
    HistoricoExerciciosFrequentesQuery,
    HistoricoComparativoQuery,
} from '../utils/validations/historicoValidation';

class HistoricoService {
    private repository: HistoricoRepository;
    private usuarioRepository: UsuarioRepository;

    constructor() {
        this.repository = new HistoricoRepository();
        this.usuarioRepository = new UsuarioRepository();
    }

    private async _resolverAlunoId(userId: string, alunoIdParam?: string): Promise<string> {
        const perfil = await this.usuarioRepository.buscarPerfilAcesso(userId);

        if (perfil.isAluno && perfil.alunoId) {
            if (alunoIdParam && alunoIdParam !== perfil.alunoId) {
                throw new Error('FORBIDDEN: você só pode visualizar seu próprio histórico');
            }
            return perfil.alunoId;
        }

        if (perfil.isAdmin) {
            if (!alunoIdParam) {
                throw new Error('UNPROCESSABLE: admin deve informar aluno_id');
            }
            return alunoIdParam;
        }

        if (perfil.isTreinador && perfil.treinadorId) {
            if (!alunoIdParam) {
                throw new Error('UNPROCESSABLE: treinador deve informar aluno_id');
            }
            const alunosDoTreinador = await this.repository.buscarAlunosDoTreinador(perfil.treinadorId);
            if (!alunosDoTreinador.includes(alunoIdParam)) {
                throw new Error('FORBIDDEN: você não tem permissão para visualizar o histórico deste aluno');
            }
            return alunoIdParam;
        }

        throw new Error('FORBIDDEN: perfil de acesso não autorizado');
    }

    async getEstatisticas(query: any, userId: string): Promise<EstatisticasHistorico> {
        const filtros: HistoricoEstatisticasQuery = historicoEstatisticasQuerySchema.parse(query);
        const alunoId = await this._resolverAlunoId(userId, filtros.aluno_id);
        return this.repository.getEstatisticas(alunoId, filtros.data_inicio, filtros.data_fim);
    }

    async getProgressao(exercicioIdParam: string, query: any, userId: string): Promise<ProgressaoItem[]> {
        const exercicioId = historicoExercicioIdSchema.parse(exercicioIdParam);
        const filtros: HistoricoProgressaoQuery = historicoProgressaoQuerySchema.parse(query);
        const alunoId = await this._resolverAlunoId(userId, filtros.aluno_id);
        return this.repository.getProgressao(alunoId, exercicioId, filtros.data_inicio, filtros.data_fim, filtros.limite);
    }

    async getGruposMusculares(query: any, userId: string): Promise<GrupoMuscularItem[]> {
        const filtros: HistoricoGruposMuscularesQuery = historicoGruposMuscularesQuerySchema.parse(query);
        const alunoId = await this._resolverAlunoId(userId, filtros.aluno_id);
        return this.repository.getGruposMusculares(alunoId, filtros.data_inicio, filtros.data_fim);
    }

    async getExerciciosFrequentes(query: any, userId: string): Promise<ExercicioFrequenteItem[]> {
        const filtros: HistoricoExerciciosFrequentesQuery = historicoExerciciosFrequentesQuerySchema.parse(query);
        const alunoId = await this._resolverAlunoId(userId, filtros.aluno_id);
        return this.repository.getExerciciosFrequentes(alunoId, filtros.data_inicio, filtros.data_fim, filtros.limite);
    }

    async getComparativo(query: any, userId: string): Promise<{
        periodo_atual_inicio: string;
        periodo_atual_fim: string;
        periodo_anterior_inicio: string;
        periodo_anterior_fim: string;
        periodo_atual: Omit<EstatisticasHistorico, 'sequencia_atual' | 'melhor_sequencia'>;
        periodo_anterior: Omit<EstatisticasHistorico, 'sequencia_atual' | 'melhor_sequencia'>;
        variacao: {
            sessoes_concluidas_pct: number | null;
            sessoes_concluidas_abs: number;
            volume_total_kg_pct: number | null;
            volume_total_kg_abs: number;
            media_duracao_minutos_pct: number | null;
            media_duracao_minutos_abs: number;
            treinos_por_semana_pct: number | null;
            treinos_por_semana_abs: number;
        };
    }> {
        const filtros: HistoricoComparativoQuery = historicoComparativoQuerySchema.parse(query);
        const alunoId = await this._resolverAlunoId(userId, filtros.aluno_id);

        const agora = new Date();
        const diasPeriodo = filtros.semanas * 7;

        const inicioAtual = new Date(agora.getTime() - diasPeriodo * 86400000).toISOString();
        const fimAtual = agora.toISOString();
        const inicioAnterior = new Date(agora.getTime() - diasPeriodo * 2 * 86400000).toISOString();
        const fimAnterior = new Date(agora.getTime() - diasPeriodo * 86400000).toISOString();

        const [statsAtual, statsAnterior] = await Promise.all([
            this.repository.getEstatisticas(alunoId, inicioAtual, fimAtual),
            this.repository.getEstatisticas(alunoId, inicioAnterior, fimAnterior),
        ]);

        const { sequencia_atual: _sa1, melhor_sequencia: _ms1, ...periodo_atual } = statsAtual;
        const { sequencia_atual: _sa2, melhor_sequencia: _ms2, ...periodo_anterior } = statsAnterior;

        const variacaoPct = (atual: number, anterior: number): number | null => {
            if (anterior === 0) return null;
            return Math.round(((atual - anterior) / anterior) * 1000) / 10;
        };

        return {
            periodo_atual_inicio: inicioAtual,
            periodo_atual_fim: fimAtual,
            periodo_anterior_inicio: inicioAnterior,
            periodo_anterior_fim: fimAnterior,
            periodo_atual,
            periodo_anterior,
            variacao: {
                sessoes_concluidas_pct: variacaoPct(statsAtual.sessoes_concluidas, statsAnterior.sessoes_concluidas),
                sessoes_concluidas_abs: statsAtual.sessoes_concluidas - statsAnterior.sessoes_concluidas,
                volume_total_kg_pct: variacaoPct(statsAtual.volume_total_kg, statsAnterior.volume_total_kg),
                volume_total_kg_abs: Math.round((statsAtual.volume_total_kg - statsAnterior.volume_total_kg) * 100) / 100,
                media_duracao_minutos_pct: variacaoPct(statsAtual.media_duracao_minutos, statsAnterior.media_duracao_minutos),
                media_duracao_minutos_abs: statsAtual.media_duracao_minutos - statsAnterior.media_duracao_minutos,
                treinos_por_semana_pct: variacaoPct(statsAtual.treinos_por_semana_media, statsAnterior.treinos_por_semana_media),
                treinos_por_semana_abs: Math.round((statsAtual.treinos_por_semana_media - statsAnterior.treinos_por_semana_media) * 10) / 10,
            },
        };
    }
}

export default HistoricoService;
