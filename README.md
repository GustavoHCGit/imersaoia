# Projetos da Imersão Alura — Dev na Era da IA

Aplicação educacional que reproduz, para fins de estudo e portfólio, os dois projetos práticos apresentados na **Imersão Engenharia de Software: Dev na Era da IA**:

- **StudyFlow:** CRUD de objetivos de estudo com React, TypeScript, componentização e persistência local.
- **Agente de planos de estudo:** formulário baseado em GCCD que gera um plano personalizado e exporta uma agenda `.ics` compatível com o Google Calendar.

> Este projeto é uma implementação educacional baseada no conteúdo da imersão. Não é o repositório oficial da Alura, não representa uma entrega oficial do curso e não reivindica autoria dos materiais da Alura.

## Requisitos

- Node.js 20 ou superior
- pnpm 10.18.0 (versão usada no `packageManager` e no workflow do GitHub Actions)

## Rodando localmente

```bash
pnpm install
pnpm dev:static
```

O preview fica disponível em `http://localhost:3000`. Para usar outra porta,
execute `PORT=4173 pnpm dev:static`.

## Verificação do projeto

Os comandos abaixo reproduzem as verificações usadas no desenvolvimento:

```bash
pnpm check
pnpm build:static
pnpm test
```

O deploy estático é feito pelo workflow `.github/workflows/deploy-pages.yml` após
um push na branch `main`. No GitHub Actions, o build usa a base `/imersaoia/`,
necessária para o endereço publicado no GitHub Pages.

A aplicação usa o navegador para persistir os objetivos do StudyFlow. Não depende de banco de dados nem de chave de API: a geração do plano é uma implementação determinística para demonstrar o fluxo do agente.

## Autoria e escopo da adaptação

**Autoria da adaptação e documentação:** Gustavo Henrique Constante Neto. O dashboard foi organizado como um projeto complementar de portfólio a partir das aulas e dos projetos da imersão. A interface, a navegação, a documentação, os exemplos locais e a exportação `.ics` são adaptações próprias; o conteúdo didático de referência pertence à Alura.

O agente desta versão não faz uma chamada real ao Google ADK nem a um modelo externo. Ele é determinístico e roda no navegador para tornar o fluxo demonstrável e fácil de testar. As referências a traces, depuração e revisão humana documentam conceitos praticados na imersão; não significam que este dashboard tenha instrumentação de observabilidade em produção.

## Conteúdo praticado

O projeto documenta Google AI Studio, Google Antigravity, prompts estruturados, método GCCD (Goal, Context, Constraints e Done When), `Agents.md`, skills, MCP, Google ADK, Cloud Shell, CLI, testes, traces, depuração, validação e revisão humana.

## Fontes

- [Página da imersão](https://cursos.alura.com.br/imersao/imersao-engenharia-software-ia-google)
- [Aula 01 — Da ideia ao código](https://cursos.alura.com.br/imersoes/aulas/aula-01-c245)
- [Aula 02 — Evolua seu software](https://cursos.alura.com.br/imersoes/aulas/aula-02-c246)
- [Aula 03 — Conectando o projeto](https://cursos.alura.com.br/imersoes/aulas/aula-03-c247)
- [Certificado da imersão](https://cursos.alura.com.br/immersion/certificate/7504594e-771b-42ab-8f5b-a4ee4dad6145)
