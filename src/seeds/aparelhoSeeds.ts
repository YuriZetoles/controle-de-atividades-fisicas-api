import { DataBase } from "../config/DbConnect";
import { aparelho } from "../config/db/schema";

export async function seedAparelhos(): Promise<string[]> {
    const aparelhosCriados = await DataBase.insert(aparelho).values([
        { nome: "Barra Reta", descricao: "Barra longa usada em exercícios compostos como supino, agachamento e levantamento terra" },
        { nome: "Halter", descricao: "Peso livre em formato de barra curta com anilhas nas extremidades, usado em pares" },
        { nome: "Máquina Smith", descricao: "Barra guiada em trilhos verticais que permite movimentos controlados de agachamento e supino" },
        { nome: "Polia / Cabo", descricao: "Sistema de cabos e polias que permite exercícios em múltiplas direções e ângulos" },
        { nome: "Leg Press", descricao: "Máquina para membros inferiores onde o aluno empurra uma plataforma inclinada com os pés" },
        { nome: "Banco Reto", descricao: "Banco horizontal sem inclinação, usado principalmente no supino reto e remada curvada" },
        { nome: "Banco Inclinado", descricao: "Banco com inclinação positiva (30–45°) para supino inclinado e exercícios de ombro" },
        { nome: "Banco Declinado", descricao: "Banco com inclinação negativa para supino declinado e abdominais" },
        { nome: "Barra EZ", descricao: "Barra com curvaturas que reduz a tensão nos pulsos em exercícios como rosca e tríceps testa" },
        { nome: "Halteres Fixos", descricao: "Pesos de tamanho reduzido com massa fixa, usados em exercícios unilaterais e bilaterais" },
        { nome: "Kettlebell", descricao: "Peso em formato de bola com alça, usado em exercícios funcionais como swing e turkish get-up" },
        { nome: "Elástico / Faixa", descricao: "Faixa elástica de resistência variável, usada como alternativa a pesos ou como auxílio em movimentos" },
    ]).returning({ id: aparelho.id });

    return aparelhosCriados.map((a) => a.id);
}
