const OpenAI = require('openai')

const rawOpenAiKey = String(process.env.OPENAI_API_KEY || '').trim()
const isPlaceholderOpenAiKey = /(coloque_|sua_chave|placeholder|example|test_key)/i.test(rawOpenAiKey)
const openai = rawOpenAiKey && !isPlaceholderOpenAiKey
  ? new OpenAI({ apiKey: rawOpenAiKey })
  : null

const OLLAMA_BASE_URL = (process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434').replace(/localhost/i, '127.0.0.1')
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1'
const OLLAMA_ENABLED = process.env.OLLAMA_ENABLED !== 'false'

const buildFallbackReply = (question) => {
  const text = String(question || '').trim()

  if (!text) {
    return 'Claro! Posso te ajudar com diagnóstico, estratégia e próximos passos. Me diga qual é o seu objetivo.'
  }

  const lower = text.toLowerCase()

  if (lower.includes('preço') || lower.includes('orcamento') || lower.includes('valor')) {
    return 'O valor depende do escopo, do prazo e da profundidade da solução. O ideal é conversar sobre o problema e te indicar a melhor proposta com clareza.'
  }

  if (lower.includes('prazo') || lower.includes('tempo')) {
    return 'O tempo varia conforme a complexidade do projeto, mas a TKS trabalha com execução clara, entregas por etapas e acompanhamento estratégico.'
  }

  if (lower.includes('serviço') || lower.includes('solução') || lower.includes('ajuda')) {
    return 'A TKS trabalha com diagnóstico, desenvolvimento, automação, estratégia digital e suporte operacional para empresas que querem crescer com mais eficiência.'
  }

  if (lower.includes('site') || lower.includes('loja') || lower.includes('landing') || lower.includes('sistema')) {
    return 'Podemos avaliar se o melhor caminho é um site institucional, uma landing page, uma automação ou uma solução mais completa para sua operação.'
  }

  return 'Posso ajudar com diagnóstico estratégico, priorização de ações, clareza operacional e definição do próximo passo mais inteligente para sua empresa.'
}

const askOllama = async (question) => {
  if (!OLLAMA_ENABLED) {
    throw new Error('Ollama desativado')
  }

  let lastError = null

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const controller = new AbortController()

    try {
      const timeoutMs = 120000
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

      const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          prompt: question,
          stream: false,
          options: {
            temperature: 0.7,
          },
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const text = await response.text()
        throw new Error(`Ollama respondeu com erro ${response.status}: ${text}`)
      }

      const data = await response.json()
      const reply = String(data?.response || '').trim()

      if (!reply) {
        throw new Error('Ollama retornou resposta vazia')
      }

      return reply
    } catch (error) {
      lastError = error

      if (error?.name === 'AbortError') {
        console.warn(`Timeout no Ollama na tentativa ${attempt}/3. Verificando novamente...`)
      } else {
        console.warn(`Erro na tentativa ${attempt}/3 do Ollama:`, error?.message || error)
      }

      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }
  }

  throw lastError || new Error('Falha ao consultar o Ollama')
}

const askOpenAi = async (question) => {
  if (!openai) {
    throw new Error('OpenAI não configurada')
  }

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.7,
    max_tokens: 350,
    messages: [
      {
        role: 'system',
        content:
          'Você é a TKS AI, assistente de inteligência executiva para clientes e empresas. Responda de forma clara, profissional, estratégica e curta. Fale em português do Brasil. Foque em diagnóstico, estratégia, operação, crescimento e próximos passos práticos.',
      },
      {
        role: 'user',
        content: question,
      },
    ],
  })

  const reply = completion?.choices?.[0]?.message?.content?.trim()

  if (!reply) {
    throw new Error('Resposta vazia da OpenAI')
  }

  return reply
}

const chatWithAi = async (req, res) => {
  const message = String(req.body?.message || '').trim()

  if (!message) {
    return res.status(400).json({
      success: false,
      message: 'Escreva sua dúvida para que eu possa te ajudar.',
    })
  }

  try {
    let reply = null
    let source = 'fallback'

    if (OLLAMA_ENABLED) {
      try {
        reply = await askOllama(message)
        source = 'ollama'
      } catch (ollamaError) {
        console.warn('Ollama indisponível, tentando OpenAI ou fallback:', ollamaError.message)
      }
    }

    if (!reply && openai) {
      try {
        reply = await askOpenAi(message)
        source = 'openai'
      } catch (openAiError) {
        console.warn('OpenAI indisponível, usando fallback:', openAiError.message)
      }
    }

    if (!reply) {
      reply = buildFallbackReply(message)
    }

    return res.json({
      success: true,
      reply,
      source,
    })
  } catch (error) {
    console.error('Erro ao conversar com a IA:', error)

    return res.json({
      success: true,
      reply: buildFallbackReply(message),
      source: 'fallback',
    })
  }
}

module.exports = { chatWithAi }
