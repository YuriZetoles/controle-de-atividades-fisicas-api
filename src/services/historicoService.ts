import HistoricoRepository, { EstatisticasHistorico, ProgressaoItem } from '../repositories/historicoRepository';
import UsuarioRepository from '../repositories/usuarioRepository';
import {
    historicoEstatisticasQuerySchema,
    historicoProgressaoQuerySchema,
    historicoExercicioIdSchema,
    HistoricoEstatisticasQuery,
    HistoricoProgressaoQuery,
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

        if (perfil.isAdmin) {
            if (!alunoIdParam) {
                throw new Error('UNPROCESSABLE: admin deve informar aluno_id');
            }
            return alunoIdParam;
        }

        if (perfil.isAluno && perfil.alunoId) {
            if (alunoIdParam && alunoIdParam !== perfil.alunoId) {
                throw new Error('FORBIDDEN: você só pode visualizar seu próprio histórico');
            }
            return perfil.alunoId;
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
}

export default HistoricoService;
