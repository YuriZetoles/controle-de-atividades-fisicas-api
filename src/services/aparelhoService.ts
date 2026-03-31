import AparelhoRepository from "../repositories/aparelhoRepository";
import { ZodError } from "zod";
import { aparelhoQuerySchema, aparelhoIdSchema } from "../utils/validations/aparelhoValidation";
import { FiltrosAparelho, ResultadoPaginadoAparelho } from "../types/filters";

class AparelhoService {
    private repository: AparelhoRepository;

    constructor() {
        this.repository = new AparelhoRepository();
    }

    async getAll(query: any): Promise<ResultadoPaginadoAparelho> {
        try {
            const { nome, ordem, page, limite } = aparelhoQuerySchema.parse(query);

            const filtros: FiltrosAparelho = { ordem, page, limite };
            if (nome) filtros.nome = nome;

            return await this.repository.getAll(filtros);
        } catch (error) {
            if (error instanceof ZodError) {
                console.warn('[AparelhoService] [getAll] Falha na validação Zod:', error.issues);
            }
            throw error;
        }
    }

    async getById(idParam: string) {
        const id = aparelhoIdSchema.parse(idParam);

        const aparelho = await this.repository.getById(id);

        if (!aparelho) {
            throw new Error('Aparelho não encontrado');
        }

        return aparelho;
    }
}

export default AparelhoService;
