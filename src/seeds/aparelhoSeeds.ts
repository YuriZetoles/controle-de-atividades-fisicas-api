import { DataBase } from "../config/DbConnect";
import { aparelho } from "../config/db/schema";

// Retorna mapa nome→id para uso nas relações de exercícios.
export async function seedAparelhos(): Promise<Record<string, string>> {
    const valores = [
        // ── Barras e pesos livres ──────────────────────────────────────────────
        { nome: "Barra Reta",           descricao: "Barra longa usada em exercícios compostos como supino, agachamento e levantamento terra" },
        { nome: "Barra EZ",             descricao: "Barra com curvaturas que reduz a tensão nos pulsos em exercícios como rosca e tríceps testa" },
        { nome: "Barra Hexagonal",      descricao: "Barra em formato hexagonal (trap bar) para levantamento terra com postura neutra" },
        { nome: "Halter",               descricao: "Peso livre em formato de barra curta, usado em pares para exercícios unilaterais e bilaterais" },
        { nome: "Kettlebell",           descricao: "Peso em formato de bola com alça, usado em exercícios funcionais como swing e goblet squat" },
        { nome: "Bola Medicinal",       descricao: "Bola pesada usada em lançamentos, abdominais e exercícios explosivos" },

        // ── Bancos ─────────────────────────────────────────────────────────────
        { nome: "Banco Reto",           descricao: "Banco horizontal sem inclinação, usado no supino reto, remada e vários exercícios" },
        { nome: "Banco Inclinado",      descricao: "Banco com inclinação positiva (30–45°) para supino inclinado e exercícios de ombro" },
        { nome: "Banco Declinado",      descricao: "Banco com inclinação negativa para supino declinado e abdominais" },
        { nome: "Banco Scott",          descricao: "Banco com apoio para o braço traseiro, usado na rosca Scott para isolar o bíceps" },

        // ── Máquinas ───────────────────────────────────────────────────────────
        { nome: "Máquina Smith",        descricao: "Barra guiada em trilhos verticais para movimentos controlados de agachamento e supino" },
        { nome: "Polia / Cabo",         descricao: "Sistema de cabos e polias que permite exercícios em múltiplas direções e ângulos" },
        { nome: "Leg Press",            descricao: "Máquina inclinada para membros inferiores onde o aluno empurra uma plataforma com os pés" },
        { nome: "Cadeira Extensora",    descricao: "Máquina de isolamento para quadríceps via extensão do joelho" },
        { nome: "Mesa Flexora",         descricao: "Máquina de isolamento para isquiotibiais via flexão do joelho em decúbito ventral" },
        { nome: "Máquina de Alavanca",  descricao: "Máquina guiada por alavanca mecânica usada em remadas, puxadas e pressão de peitoral" },
        { nome: "Máquina de Panturrilha", descricao: "Máquina específica para elevação de panturrilha em pé ou sentado" },

        // ── Acessórios ─────────────────────────────────────────────────────────
        { nome: "Elástico / Faixa",     descricao: "Faixa elástica de resistência variável, usada como alternativa a pesos ou auxílio em movimentos" },
        { nome: "Roda Abdominal",       descricao: "Roda com cabo para exercício de extensão de core com alta ativação de abdominais e ombros" },
        { nome: "Corda de Pular",       descricao: "Corda para exercícios aeróbicos de alta intensidade e coordenação" },
        { nome: "Bola de Estabilidade", descricao: "Bola inflável grande para exercícios de equilíbrio, core e flexibilidade" },

        // ── Cardio ─────────────────────────────────────────────────────────────
        { nome: "Bicicleta Ergométrica", descricao: "Bicicleta estacionária de academia para treino aeróbico de baixo impacto" },
        { nome: "Elíptico",             descricao: "Máquina cardiovascular de movimento elíptico que simula corrida sem impacto nas articulações" },
        { nome: "Esteira",              descricao: "Esteira ergométrica para caminhada ou corrida em ambiente controlado" },

        // ── Peso do próprio corpo ──────────────────────────────────────────────
        { nome: "Peso Corporal",        descricao: "Exercícios realizados apenas com o peso do próprio corpo, sem equipamento externo" },
    ];

    const criados = await DataBase.insert(aparelho).values(valores).returning({ id: aparelho.id, nome: aparelho.nome });

    return Object.fromEntries(criados.map((a) => [a.nome, a.id]));
}
