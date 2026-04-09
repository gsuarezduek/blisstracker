const prisma = require('./prisma')

/**
 * Persists token usage for an AI call (non-blocking — never throws).
 * @param {'insight'|'weeklyReport'|'insightMemory'} service
 * @param {number|null} userId
 * @param {{ input_tokens: number, output_tokens: number }} usage  — Anthropic usage object
 */
async function logTokens(service, userId, usage) {
  try {
    await prisma.aiTokenLog.create({
      data: {
        service,
        userId: userId ?? null,
        inputTokens:  usage.input_tokens  ?? 0,
        outputTokens: usage.output_tokens ?? 0,
      },
    })
  } catch (err) {
    console.error('[logTokens] Error al guardar uso de tokens:', err.message)
  }
}

module.exports = { logTokens }
