# Análise técnica — imersão.ia

## 1. Resumo executivo

O projeto está funcional como aplicação estática React/TypeScript. O endereço publicado carrega diretamente, a base `/imersaoia/` está configurada para GitHub Pages e o fluxo principal não depende de backend, banco ou chave de API.

A análise encontrou uma implementação coerente e relativamente honesta para portfólio: o StudyFlow é um CRUD real com `localStorage`; o agente gera planos de forma determinística no navegador e exporta `.ics`. A principal lacuna não é de funcionamento, mas de escopo: conceitos como Google ADK, MCP, skills, traces e observabilidade aparecem como documentação ou referência, não como integrações implementadas nesta aplicação.

Foi feita uma melhoria localizada no `README.md`, adicionando requisitos, endereço local, comandos de verificação e explicação do deploy no GitHub Pages.

## 2. Link público e resultado do teste

**Status: funcionando.**

Link publicado: <https://gustavohcgit.github.io/imersaoia/>

Evidências:

- a página abriu diretamente em nova navegação;
- o título exibido foi `imersão.ia — Projetos da Imersão Alura`;
- layout, navegação lateral, cards, formulário e conteúdo visual foram renderizados;
- JavaScript e CSS carregaram o aplicativo;
- a configuração do Vite usa `base: "/imersaoia/"` quando executada no GitHub Actions;
- o roteamento usa `useHashLocation` no build de GitHub Pages, reduzindo o risco de 404 em atualização de rota;
- não houve tela vazia ou erro visual durante a navegação;
- o preview local registrou apenas mensagens normais do Vite/React DevTools, sem exceção de runtime.

A navegação interna é feita por estado React, e não por URLs distintas. Portanto, o endereço raiz abre corretamente; não há expectativa de deep link para `/studyflow` ou `/agent` porque essas páginas não são rotas independentes.

## 3. Resultado da instalação

A instalação foi reproduzida com sucesso:

```text
pnpm install --frozen-lockfile   OK
pnpm check                       OK
a pnpm build:static              OK
pnpm test                        OK — 2 arquivos, 6 testes
```

O projeto declara `pnpm@10.18.0` no `packageManager` e possui `pnpm-lock.yaml`. O README agora informa Node.js 20+, pnpm 10.18.0, `pnpm dev:static`, `pnpm check`, `pnpm build:static` e `pnpm test`.

Não há banco ou chave obrigatória para o fluxo estático. O repositório também possui um servidor/template mais amplo, mas o caminho indicado para este produto é o modo estático.

Observação de build: o Vite exibe um aviso sobre `<script src="/api/platform/config.js">` sem `type="module"`; o build termina com sucesso e o aviso não impede a aplicação estática.

## 4. Tabela de funcionalidades

| Funcionalidade | Resultado | Evidência | Correção necessária |
|---|---|---|---|
| Criar objetivo | funcionando | formulário adicionou um terceiro objetivo e atualizou os indicadores | não |
| Editar objetivo | funcionando por código e controle presente | `editGoal` carrega dados e `submitGoal` atualiza pelo id | não |
| Excluir objetivo | funcionando por código e controle presente | confirmação seguida de `filter` e toast | não |
| Concluir/reabrir objetivo | funcionando | botão alterna `completed`, progresso e estado visual | não |
| Persistência após atualizar | funcionando | objetivo criado permaneceu após nova navegação | não |
| Persistência em localStorage | funcionando | chave `imersao-studyflow-goals`, validação de payload e tratamento de erro | não |
| Navegação entre páginas | funcionando | navegação lateral e CTAs alteram a view | não |
| Abertura do StudyFlow | funcionando | botão e card abrem a view | não |
| Abertura do agente | funcionando | botão e item lateral abrem a view | não |
| Formulário do agente | funcionando | campos de tema, objetivo, disponibilidade, duração, ritmo e data | não |
| Validação de obrigatórios | funcionando | tema, objetivo e data são verificados antes de gerar | não |
| Geração do plano | funcionando | `createPlan` gera semanas e tarefas de forma determinística | não |
| Exibição do plano | funcionando | timeline apresenta foco e tarefas por semana | não |
| Exportação `.ics` | funcionando por implementação | Blob e download `plano-de-estudos.ics` são gerados | não |
| Copiar resumo | funcionando em navegador com Clipboard API | `navigator.clipboard.writeText` e toast de sucesso | validar fallback opcional |
| Estado vazio | funcionando por implementação | `goals.length === 0` exibe mensagem orientativa | não |
| Tela menor | funcionando por CSS | breakpoints em 980px e 720px reorganizam layout | testar em dispositivo real antes da apresentação |
| Tratamento de erros | parcial | localStorage e validação têm tratamento; exportação/cópia têm cobertura menor | prioridade 3 |
| Botões sem ação | não identificado | controles inspecionados têm handlers ou links | não |

## 5. Problemas críticos

Nenhum problema crítico bloqueia o uso observado.

## 6. Problemas de média prioridade

Nenhum problema de média prioridade foi confirmado. A principal cautela de apresentação é não descrever o agente como integração real com Google ADK: a própria aplicação informa corretamente que ele é local e determinístico.

## 7. Melhorias opcionais

1. Adicionar testes de componente ou de integração para o CRUD e para a geração do conteúdo `.ics`.
2. Adicionar uma mensagem de sucesso específica após exportação, caso o navegador permita confirmar o download.
3. Tratar rejeições da Clipboard API com `try/catch`, além do teste de existência de `navigator.clipboard`.
4. Considerar URLs com hash para cada view se for importante compartilhar diretamente a tela do StudyFlow ou do agente.
5. Remover ou separar arquivos do template que não participam do produto estático, caso o objetivo seja um repositório de portfólio mais enxuto.

## 8. Comparação com o curso da Alura

### Implementado no código

- React e TypeScript;
- componentização básica e organização por página/componentes;
- StudyFlow com criação, edição, conclusão, exclusão e persistência local;
- formulário de agente e geração de plano;
- exportação de agenda `.ics`;
- validações e estados vazios;
- workflow de build e publicação no GitHub Pages;
- `Agents.md` como arquivo de contexto didático.

### Documentado, mas não implementado como integração

- Google AI Studio;
- Google Antigravity;
- Google ADK;
- skills e toolsets;
- MCP;
- Cloud Shell e CLI;
- traces, depuração e revisão humana como práticas de engenharia.

### Apenas citado como referência

- ADK Web;
- Environment Toolset;
- Harness;
- instrumentação de observabilidade em produção;
- chamadas a modelo externo.

### Ausente

- chamada real ao Google ADK;
- agente baseado em modelo externo;
- servidor de ferramentas MCP conectado ao produto;
- armazenamento remoto;
- traces reais ou painel de observabilidade;
- suíte de testes de interface cobrindo todos os fluxos.

A separação acima é importante e está alinhada com o README: a implementação é uma demonstração local, não uma integração oficial ou completa das tecnologias citadas.

## 9. Avaliação de autoria e nível técnico

O projeto demonstra entendimento suficiente para explicar o fluxo principal: os tipos são explícitos, a persistência é legível, a função de geração do plano é determinística e o README registra limitações relevantes. A identidade visual, a nomenclatura e a organização da interface também foram adaptadas para um dashboard de portfólio.

O nível demonstrado é **iniciante avançado**, aproximando-se de intermediário na parte de frontend. O que impede uma avaliação intermediária mais forte é a cobertura de testes de produto, a ausência de integração real do agente e a concentração de boa parte da aplicação em `Home.tsx`. Não há evidência suficiente para afirmar cópia direta nem autoria indevida; ao contrário, o projeto explicita que é uma adaptação educacional.

## 10. Revisão da documentação

### Alterações realizadas

**Texto atual:** o README ensinava apenas `pnpm install` e `pnpm dev:static`.

**Problema:** faltavam pré-requisitos, endereço esperado, comandos de verificação e explicação da base do GitHub Pages.

**Texto sugerido/aplicado:** foram adicionadas as seções `Requisitos` e `Verificação do projeto`, com Node.js 20+, pnpm 10.18.0, `pnpm check`, `pnpm build:static`, `pnpm test` e a explicação de `/imersaoia/`.

**Motivo:** tornar a instalação reproduzível para uma pessoa iniciante e reduzir dúvidas no momento da apresentação.

### Pontos positivos mantidos

- aviso explícito de que não é o repositório oficial da Alura;
- autoria da adaptação identificada;
- agente descrito como determinístico e local;
- distinção entre conceitos estudados e funcionalidades realmente entregues;
- fontes da imersão e certificado identificados.

### Ajuste de linguagem recomendado para uma próxima revisão

A frase “O projeto documenta Google AI Studio, Google Antigravity, ... Google ADK” pode ser lida como se todas as integrações estivessem presentes. Uma formulação ainda mais precisa seria: “O projeto registra conceitos estudados na imersão, incluindo ...; nesta versão, somente o fluxo local determinístico do agente está implementado.”

## 11. Plano de correção priorizado

### Prioridade 1

- Nenhuma correção bloqueadora identificada.

### Prioridade 2

- Nenhuma correção funcional confirmada.
- Antes de apresentar, explicar verbalmente que o agente é determinístico e não chama Google ADK ou modelo externo.

### Prioridade 3

- Adicionar testes de UI e de exportação `.ics`.
- Melhorar o tratamento de falhas de Clipboard API e download.
- Avaliar hash por view e uma decomposição adicional de `Home.tsx`.
- Tornar a distinção entre “implementado” e “estudado/documentado” ainda mais explícita no README.

## 12. Conclusão

- **O projeto está funcionando?** Sim, no fluxo estático testado.
- **A instalação está documentada corretamente?** Sim, após a melhoria do README.
- **O link abre diretamente no navegador?** Sim: <https://gustavohcgit.github.io/imersaoia/>.
- **O projeto condiz com o curso?** Sim, como adaptação educacional dos temas e fluxos, não como implementação oficial de todas as ferramentas.
- **O que realmente foi implementado?** StudyFlow CRUD com localStorage, agente determinístico, geração de plano, exportação `.ics`, interface e deploy estático.
- **O que ainda é demonstração?** Google ADK, MCP, skills, traces, observabilidade e chamadas externas.
- **Está pronto para portfólio?** Sim, desde que a apresentação mantenha essa distinção técnica.
- **O que fazer antes de apresentar?** Usar o link local abaixo para uma última demonstração, mencionar as limitações do agente e, se houver tempo, adicionar testes de UI.
