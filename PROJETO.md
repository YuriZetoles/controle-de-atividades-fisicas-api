# **PROJETO DE SOFTWARE - SPOTTER**

## ***Stakeholders***

| NOME | CARGO/PAPEL | E-MAIL/CONTATO |
| :---- | :---- | :---- |
| Jose Lucas Brandao Montes | Professor/Cliente | lucas.montes@ifro.edu.br |

## ***Equipe de Desenvolvimento***

| NOME | CARGO/PAPEL | E-MAIL/CONTATO |
| :---- | :---- | :---- |
| Lucca Livino | Desenvolvedor | lucca.f.livino@gmail.com |
| Ruan Lopes | Desenvolvedor | intel.spec.lopes@gmail.com |
| Yuri Zetoles | Desenvolvedor | yurizetoles0123@gmail.com |
| João Kmniecik | Desenvolvedor | joao.kmniecik@estudante.ifro.edu.br |

# **RESUMO DO PROJETO**

|  |  |
| :---- | :---- |
| **NOME** | Spotter |
| **PRINCIPAL OBJETIVO** | Desenvolver uma plataforma que possibilite a boa comunicação entre personal trainer e alunos, além de gerenciar rotinas de treinos. |
| **BENEFÍCIOS ESPERADOS** | Facilitar o acompanhamento de treinos, melhorar a comunicação instrutor-aluno e centralizar informações de progresso. |
| **INÍCIO E TÉRMINO PREVISTOS** | 10/02/2026 - 23/06/2026 |

# **INTRODUÇÃO**

O Spotter é uma solução integrada para o gerenciamento de atividades físicas, focada na interação entre treinadores e alunos. O sistema permite que treinadores prescrevam treinos personalizados, acompanhem a evolução dos alunos e mantenham um canal de comunicação direto, enquanto os alunos podem visualizar suas rotinas, registrar a execução dos exercícios e monitorar seu próprio progresso.

## **PROPÓSITO DESTE DOCUMENTO**

O objetivo deste documento é detalhar a concepção, arquitetura, requisitos e funcionalidades do sistema Spotter. Ele serve como um guia para o desenvolvimento contínuo, manutenção e para que outros possam entender o software, garantindo que as informações relevantes estejam organizadas e acessíveis.

## **CONCEPÇÃO DO SISTEMA**

A ideia para o desenvolvimento do sistema partiu de uma necessidade identificada de reunir funções existentes em outros aplicativos de organização de exercícios, como dados estatísticos de progressão, comunicação via chat, fácil organização, disposição e demonstração dos exercícios, organização de locais de treino bem como dados dos personal trainers, em um único ecossistema.

# **DESCRIÇÃO GERAL**

O Spotter é composto por uma API robusta e um aplicativo móvel. Ele serve como uma cartilha de treino digital para alunos e personal trainers, permitindo a execução de rotinas de treinos de forma descomplicada e ágil.

## **USUÁRIOS DO SISTEMA (ATORES)**

| ATOR | DESCRIÇÃO |
| :---- | :---- |
| Instrutor/Personal Trainer | O personal trainer gerencia os treinos de seus alunos, criando, editando ou removendo rotinas. Acompanha a execução e progressão, e comunica-se via chat. |
| Aluno | O aluno visualiza e executa rotinas de treinos, podendo também criar treinos próprios ou editar os sugeridos pelo treinador (ajuste de carga/séries). |

## **ABRANGÊNCIA E SISTEMAS SIMILARES**

O sistema visa abranger desde usuários iniciantes até experientes em ambientes de academia.
Sistemas similares: **Gym Day** (foco na execução) e **Trainiac** (foco na prescrição).

## **SUPOSIÇÕES E DEPENDÊNCIAS**

* **Suposições:**
  * O usuário possui um dispositivo móvel.
  * Acesso à internet para sincronização de dados.
* **Dependências:**
  * **Backend:** Node.js 22+, PostgreSQL.
  * **Mobile:** Desenvolvido em Kotlin/Compose Multiplatform.

# **ESTUDO DE VIABILIDADE**

* **Viabilidade Técnica:**
  * As tecnologias utilizadas (Node.js, TypeScript, Express, PostgreSQL, Drizzle ORM, BetterAuth, Minio) são modernas, estáveis e amplamente utilizadas.
  * A arquitetura baseada em APIs RESTful permite uma clara separação entre backend e frontend/mobile.
  * O uso de Docker facilita a implantação e escalabilidade.
  * **Conclusão:** Tecnicamente, o projeto é viável.  
* **Viabilidade Econômica:**
  * **Custos de Desenvolvimento:** Tempo e mão de obra da equipe.  
  * **Custos de Infraestrutura:** Otimizados pelo uso de containers e softwares open-source. Pode ser hospedado em nuvens públicas ou servidores próprios.
  * **Conclusão:** É economicamente viável.
* **Viabilidade Operacional:**
  * O sistema é projetado para ser intuitivo, com foco na facilidade de uso durante o treino.
  * A manutenção é facilitada pelo uso de TypeScript e Drizzle ORM (type-safety).
  * **Conclusão:** É operacionalmente viável.  
* **Viabilidade Legal:**
  * Utiliza bibliotecas com licenças permissivas.  
  * Conformidade com a LGPD no tratamento de dados sensíveis de saúde e biometria.
  * **Conclusão:** Legalmente viável.

# **METODOLOGIA ADOTADA NO DESENVOLVIMENTO**

Para o desenvolvimento, a equipe optou pela metodologia ágil, utilizando **Kanban** com definição clara de tarefas e entregas contínuas.

# **REQUISITOS DO SOFTWARE**

## **REQUISITOS FUNCIONAIS**

| ID | NOME | DESCRIÇÃO | PRIORIDADE |
| :---- | :---- | :---- | :---- |
| RF001 | Cadastro de usuário | O sistema deve permitir o cadastro de usuários (Aluno/Treinador). | Alta |
| RF002 | Login de usuário | O sistema deve permitir o login seguro via BetterAuth. | Alta |
| RF003 | Perfil do Usuário | Gestão de informações básicas e fotos de perfil. | Alta |
| RF004 | Demonstração de exercícios | Exibição de GIFs/vídeos demonstrativos para orientação. | Alta |
| RF005 | Execução de Treino | Registro de séries, repetições e cargas em tempo real. | Alta |
| RF006 | Histórico de treino | Registro e consulta de sessões de treino realizadas. | Alta |
| RF007 | Treino próprio | Possibilidade do aluno criar seus próprios treinos. | Alta |
| RF008 | Prescrição de treinos | O treinador pode criar e atribuir treinos aos seus alunos. | Alta |
| RF009 | Gestão de Alunos | O treinador pode visualizar e gerenciar sua lista de alunos vinculados. | Alta |
| RF010 | Chat Integrado | Comunicação direta entre aluno e treinador via chat. | Alta |
| RF011 | Estatísticas de Progresso | Gráficos de evolução de carga e frequência de treinos. | Média |
| RF012 | Busca de Treinador | Alunos podem buscar profissionais para acompanhamento. | Média |
| RF013 | Gestão de Academias | Cadastro e vínculo de usuários às academias que frequentam. | Média |

## **REQUISITOS NÃO FUNCIONAIS**

| ID | NOME | DESCRIÇÃO | PRIORIDADE |
| :---- | :---- | :---- | :---- |
| RNF001 | Segurança | Uso de JWT, hashing de senhas e políticas de CORS. | Alta |
| RNF002 | Performance | Respostas da API em tempo inferior a 300ms. | Média |
| RNF003 | Disponibilidade | Meta de 99.5% de tempo de atividade (uptime). | Alta |
| RNF004 | Escalabilidade | Arquitetura containerizada pronta para escalonamento horizontal. | Média |
| RNF005 | Integridade | Uso de transações de banco de dados e validações via Zod. | Alta |

# **DIAGRAMA DE CASOS DE USO**

## **DESCRIÇÃO TEXTUAL DOS CASOS DE USO**

* **Personal Trainer:**  
  * **Prescrever Treino**: Seleciona aluno, escolhe exercícios, define séries/repetições/descanso.
  * **Analisar Progresso**: Visualiza histórico e gráficos de carga do aluno.
* **Aluno:**  
  * **Iniciar Sessão de Treino**: Seleciona o treino do dia e registra a execução de cada série.
  * **Vincular Treinador**: Busca um profissional pelo nome ou CREF e solicita acompanhamento.

# **DIAGRAMA DE CLASSES**

*O diagrama de classes reflete a estrutura definida no schema do Drizzle, incluindo entidades como User, Aluno, Treinador, Treino, Exercicio, SessaoTreino e Conversa.*

# **DIAGRAMA DE SEQUÊNCIA**

*Representa o fluxo de autenticação, prescrição de treinos e registro de sessões de exercício.*

# **DIAGRAMA DE ATIVIDADES**

*Fluxo de execução de um treino: Início -> Seleção de Exercício -> Registro de Séries -> Finalização -> Atualização de Histórico.*