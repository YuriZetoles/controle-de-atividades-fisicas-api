import { DataBase } from "../config/DbConnect";
import { eq, and, isNull, asc, desc, count, sql } from "drizzle-orm";
import { aparelho, exercicio_aparelho, exercicio } from "../config/db/schema";
import { parseDatabaseError } from "../utils/errors/DatabaseError";
import { FiltrosAparelho, ResultadoPaginadoAparelho } from "../types/filters";

class AparelhoRepository {
    private db: typeof DataBase;
    constructor() {
        this.db = DataBase;
    }

    async getAll(filtros: FiltrosAparelho): Promise<ResultadoPaginadoAparelho> {
        try {
            const {
                nome,
                ordem = 'nome_asc',
                page = 1,
                limite = 20,
            } = filtros;

            const condicoes = [];
            if (nome) {
                condicoes.push(
                    sql`unaccent(lower(${aparelho.nome})) ilike unaccent(lower(${`%${nome}%`}))`
                );
            }
            const where = condicoes.length > 0 ? and(...condicoes) : undefined;
            const offset = (page - 1) * limite;

            let dados: { id: string; nome: string; descricao: string }[];

            if (ordem === 'popularidade_desc') {
                const popularidadeSq = this.db
                    .select({
                        aparelho_id: exercicio_aparelho.aparelho_id,
                        total_exercicios: count(exercicio_aparelho.exercicio_id).as('total_exercicios'),
                    })
                    .from(exercicio_aparelho)
                    .innerJoin(
                        exercicio,
                        and(
                            eq(exercicio_aparelho.exercicio_id, exercicio.id),
                            isNull(exercicio.deletado_em),
                        ),
                    )
                    .groupBy(exercicio_aparelho.aparelho_id)
                    .as('popularidade');

                dados = await this.db
                    .select({
                        id: aparelho.id,
                        nome: aparelho.nome,
                        descricao: aparelho.descricao,
                    })
                    .from(aparelho)
                    .leftJoin(popularidadeSq, eq(aparelho.id, popularidadeSq.aparelho_id))
                    .where(where)
                    .orderBy(desc(popularidadeSq.total_exercicios), asc(aparelho.nome))
                    .limit(limite)
                    .offset(offset);
            } else {
                dados = await this.db
                    .select({
                        id: aparelho.id,
                        nome: aparelho.nome,
                        descricao: aparelho.descricao,
                    })
                    .from(aparelho)
                    .where(where)
                    .orderBy(ordem === 'nome_desc' ? desc(aparelho.nome) : asc(aparelho.nome))
                    .limit(limite)
                    .offset(offset);
            }

            const [countResult] = await this.db
                .select({ count: sql<number>`count(*)` })
                .from(aparelho)
                .where(where);

            const total = Number(countResult.count);

            return { dados, total, page, limite, totalPages: Math.ceil(total / limite) };
        } catch (error) {
            throw parseDatabaseError(error, 'AparelhoRepository.getAll');
        }
    }

    async getById(id: string) {
        try {
            const resultado = await this.db
                .select({
                    id: aparelho.id,
                    nome: aparelho.nome,
                    descricao: aparelho.descricao,
                })
                .from(aparelho)
                .where(eq(aparelho.id, id));

            if (!resultado[0]) return null;

            const exerciciosVinculados = await this.db
                .select({
                    exercicio_id: exercicio.id,
                    nome: exercicio.nome,
                    descricao: exercicio.descricao,
                })
                .from(exercicio_aparelho)
                .innerJoin(exercicio, eq(exercicio_aparelho.exercicio_id, exercicio.id))
                .where(and(
                    eq(exercicio_aparelho.aparelho_id, id),
                    isNull(exercicio.deletado_em),
                ));

            return {
                ...resultado[0],
                exercicios: exerciciosVinculados.map((e) => ({
                    exercicio_id: e.exercicio_id,
                    nome: e.nome,
                    descricao: e.descricao,
                })),
            };
        } catch (error) {
            throw parseDatabaseError(error, 'AparelhoRepository.getById');
        }
    }
}

export default AparelhoRepository;
