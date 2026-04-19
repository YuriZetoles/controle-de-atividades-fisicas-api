import { eq } from 'drizzle-orm';
import { DataBase } from '../config/DbConnect';
import { aluno, treinador, exercicio, treino, treino_exercicio } from '../config/db/schema';

type TreinoSeedInput = {
    nome: string;
    descricao: string;
    alunoNome: string;
    treinadorNome: string | null;
    exercicios: Array<{
        nome: string;
        series: number;
        repeticoes: string;
        carga_sugerida: string | null;
        tempo_descanso_segundos: number;
        ordem_execucao: number;
    }>;
};

const treinosSeed: TreinoSeedInput[] = [
    {
        nome: 'Treino A - Peito e Triceps',
        descricao: 'Foco em peitoral e triceps para hipertrofia.',
        alunoNome: 'Ana Beatriz Oliveira',
        treinadorNome: 'Marcos Antônio Rocha',
        exercicios: [
            {
                nome: 'Supino Reto com Barra',
                series: 4,
                repeticoes: '8-12',
                carga_sugerida: '30.00',
                tempo_descanso_segundos: 90,
                ordem_execucao: 1,
            },
            {
                nome: 'Tríceps Testa com Barra EZ',
                series: 3,
                repeticoes: '10-12',
                carga_sugerida: '15.00',
                tempo_descanso_segundos: 75,
                ordem_execucao: 2,
            },
        ],
    },
    {
        nome: 'Treino B - Pernas',
        descricao: 'Treino de membros inferiores com ênfase em quadriceps.',
        alunoNome: 'Ana Beatriz Oliveira',
        treinadorNome: 'Marcos Antônio Rocha',
        exercicios: [
            {
                nome: 'Agachamento com Barra',
                series: 4,
                repeticoes: '8-10',
                carga_sugerida: '40.00',
                tempo_descanso_segundos: 120,
                ordem_execucao: 1,
            },
        ],
    },
    {
        nome: 'Treino C - Ombros',
        descricao: 'Treino para deltoides e estabilidade de ombro.',
        alunoNome: 'Rafael Mendes Costa',
        treinadorNome: 'Marcos Antônio Rocha',
        exercicios: [
            {
                nome: 'Desenvolvimento com Halter',
                series: 4,
                repeticoes: '10-12',
                carga_sugerida: '18.00',
                tempo_descanso_segundos: 90,
                ordem_execucao: 1,
            },
        ],
    },
    {
        nome: 'Treino D - Base Geral',
        descricao: 'Treino geral para condicionamento inicial.',
        alunoNome: 'Juliana Ferreira Lima',
        treinadorNome: 'Fernanda Souza Almeida',
        exercicios: [
            {
                nome: 'Agachamento com Barra',
                series: 3,
                repeticoes: '12-15',
                carga_sugerida: '25.00',
                tempo_descanso_segundos: 90,
                ordem_execucao: 1,
            },
            {
                nome: 'Supino Reto com Barra',
                series: 3,
                repeticoes: '10-12',
                carga_sugerida: '20.00',
                tempo_descanso_segundos: 90,
                ordem_execucao: 2,
            },
        ],
    },
];

export async function seedTreinos(): Promise<void> {
    for (const treinoSeed of treinosSeed) {
        const [alunoEncontrado] = await DataBase
            .select({ id: aluno.id })
            .from(aluno)
            .where(eq(aluno.nome, treinoSeed.alunoNome))
            .limit(1);

        if (!alunoEncontrado) {
            throw new Error(`[seedTreinos] Aluno não encontrado: ${treinoSeed.alunoNome}`);
        }

        let treinadorId: string | null = null;
        if (treinoSeed.treinadorNome) {
            const [treinadorEncontrado] = await DataBase
                .select({ id: treinador.id })
                .from(treinador)
                .where(eq(treinador.nome, treinoSeed.treinadorNome))
                .limit(1);

            if (!treinadorEncontrado) {
                throw new Error(`[seedTreinos] Treinador não encontrado: ${treinoSeed.treinadorNome}`);
            }

            treinadorId = treinadorEncontrado.id;
        }

        const [treinoCriado] = await DataBase
            .insert(treino)
            .values({
                nome: treinoSeed.nome,
                descricao: treinoSeed.descricao,
                usuario_id: alunoEncontrado.id,
                treinador_id: treinadorId,
            })
            .returning({ id: treino.id });

        for (const item of treinoSeed.exercicios) {
            const [exercicioEncontrado] = await DataBase
                .select({ id: exercicio.id })
                .from(exercicio)
                .where(eq(exercicio.nome, item.nome))
                .limit(1);

            if (!exercicioEncontrado) {
                throw new Error(`[seedTreinos] Exercício não encontrado: ${item.nome}`);
            }

            await DataBase.insert(treino_exercicio).values({
                treino_id: treinoCriado.id,
                exercicio_id: exercicioEncontrado.id,
                series: item.series,
                repeticoes: item.repeticoes,
                carga_sugerida: item.carga_sugerida,
                tempo_descanso_segundos: item.tempo_descanso_segundos,
                ordem_execucao: item.ordem_execucao,
            });
        }
    }
}
