import { and, eq, gte, inArray, lte, SQL } from 'drizzle-orm';
import { sessao_treino } from '../../config/db/schema';

type StatusSessao = 'EM_ANDAMENTO' | 'CONCLUIDA' | 'CANCELADA';

class SessaoFilterBuilder {
    private condicoes: SQL[] = [];

    comAlunoId(alunoId?: string) {
        if (alunoId?.trim()) {
            this.condicoes.push(eq(sessao_treino.aluno_id, alunoId.trim()));
        }
        return this;
    }

    comAlunoIds(alunoIds?: string[]) {
        if (alunoIds && alunoIds.length > 0) {
            this.condicoes.push(inArray(sessao_treino.aluno_id, alunoIds));
        }
        return this;
    }

    comTreinoId(treinoId?: string) {
        if (treinoId?.trim()) {
            this.condicoes.push(eq(sessao_treino.treino_id, treinoId.trim()));
        }
        return this;
    }

    comStatus(status?: StatusSessao) {
        if (status) {
            this.condicoes.push(eq(sessao_treino.status, status));
        }
        return this;
    }

    comDataInicio(dataInicio?: string) {
        if (dataInicio) {
            this.condicoes.push(gte(sessao_treino.inicio, new Date(dataInicio)));
        }
        return this;
    }

    comDataFim(dataFim?: string) {
        if (dataFim) {
            this.condicoes.push(lte(sessao_treino.inicio, new Date(dataFim)));
        }
        return this;
    }

    build() {
        return and(...this.condicoes);
    }
}

export default SessaoFilterBuilder;
