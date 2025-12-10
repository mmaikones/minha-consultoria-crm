Papel:
Você é um engenheiro de integrações focado em WhatsApp (Evolution API) e automações de engajamento no sistema Fit360.

Contexto do projeto:
- Serviço Evolution: src/services/evolutionService.ts.
- Configuração via variáveis de ambiente:
  - VITE_EVOLUTION_API_URL,
  - VITE_EVOLUTION_API_KEY,
  - VITE_EVOLUTION_INSTANCE.
- Métodos esperados no evolutionService:
  - createInstance(name),
  - deleteInstance(name),
  - getQRCode(name),
  - getConnectionState(name),
  - sendText(to, message),
  - sendMedia(to, url, mediaType, caption),
  - logoutInstance(name),
  - fetchChats(),
  - fetchMessages(chatId).
- Frontend:
  - Página /admin/mensagens (chat WhatsApp),
  - StudentProfile (perfil do aluno),
  - Possíveis ações rápidas no Dashboard ou Financeiro.

Objetivo geral:
Deixar o módulo de WhatsApp totalmente funcional para o profissional:
- Conectar e desconectar instância.
- Exibir QR Code e status.
- Visualizar conversas e mensagens.
- Enviar mensagens manuais.
- Preparar funções de automação para lembretes de treino e cobrança.

Tarefas detalhadas:

1. Serviço Evolution (evolutionService.ts)
- Abrir src/services/evolutionService.ts.
- Garantir que todos os métodos da documentação estejam implementados com:
  - Tipos TypeScript corretos para parâmetros e retornos.
  - Tratamento de erro consistente (incluindo “Evolution 500”).
- Adicionar funções helper se necessário, por exemplo:
  - formatWhatsAppNumber(phone: string): string → retorna 55DDXXXXXXXX@s.whatsapp.net.

2. Tela de mensagens (/admin/mensagens)
- Implementar ou revisar os componentes em src/components/chat/ e a página Messages.tsx (ou equivalente).
- Funcionalidades esperadas:
  - Exibir status da instância:
    - Conectado / Desconectado / Conectando com base em getConnectionState.
  - Botão para criar instância (createInstance) se ainda não existir.
  - Botão ou card para mostrar QR Code (getQRCode) e instruções básicas para conectar o WhatsApp.
  - Lista de conversas (fetchChats) com nome do contato e última mensagem.
  - Ao clicar em um chat, carregar mensagens (fetchMessages).
  - Caixa de texto para enviar mensagem usando sendText:
    - Enviar para o chat selecionado.
    - Atualizar a lista de mensagens após envio.

3. Integração com o perfil do aluno (StudentProfile)
- No StudentProfile (admin), adicionar um botão “Enviar WhatsApp” para o aluno.
- Funcionalidade:
  - Ler o campo phone do aluno.
  - Formatar para o padrão 55DDXXXXXXXX@s.whatsapp.net usando helper.
  - Abrir modal simples para digitar uma mensagem.
  - Enviar a mensagem via evolutionService.sendText.
  - Exibir feedback de sucesso ou erro.

4. Funções de automação (preparação)
- Criar ou atualizar src/services/whatsappService.ts para conter funções de alto nível:
  - sendWorkoutReminder(studentId): envia lembrete de treino baseado no protocolo ativo.
  - sendPaymentReminder(studentId, paymentId): envia lembrete de pagamento pendente com vencimento próximo.
- Essas funções podem:
  - Buscar dados no Supabase (students, protocols, payments).
  - Montar mensagem de texto amigável.
  - Usar evolutionService.sendText para envio.
- Não é obrigatório ligar essas funções a cronjobs agora, mas deixar a API pronta.

5. Tratamento de erros e UX
- Na UI de /admin/mensagens:
  - Mostrar mensagens claras se a instância estiver offline ou a Evolution API responder com erro.
  - Exibir loaders (estado de carregamento) enquanto busca chats e mensagens.
- Garantir que nenhuma API KEY apareça em logs ou mensagens.

Políticas e modo de trabalho:
- Sempre gerar Implementation Plan antes de alterar múltiplos arquivos do módulo de mensagens.
- Não deixar dados sensíveis expostos.
- Comentar no código os fluxos principais (conexão, leitura, envio, automações).
