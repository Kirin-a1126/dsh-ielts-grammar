/**
 * Host half of dsh-ielts-grammar.
 *
 * The browser half posts drafts to this same-origin route. Analysis stays on the
 * local machine, has no model cost, and returns character ranges that the UI can
 * replace directly. The route disappears with the plugin's Cordis effect.
 *
 * @module dsh-ielts-grammar
 */

import { analyze, MAX_TEXT_LENGTH } from './analyzer.js'

export const name = 'ielts-grammar'

const ROUTE_PATH = '/dsh-ielts-grammar/analyze'
const BODY_LIMIT = 128 * 1024

function sendJson (response, status, value) {
  const body = JSON.stringify(value)
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  })
  response.end(body)
}

function readBody (request) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    request.on('data', (chunk) => {
      size += chunk.length
      if (size > BODY_LIMIT) {
        reject(Object.assign(new Error('BODY_TOO_LARGE'), { code: 'BODY_TOO_LARGE' }))
        request.destroy()
        return
      }
      chunks.push(chunk)
    })
    request.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    request.on('error', reject)
  })
}

async function handler (request, response) {
  if (request.method !== 'POST') {
    sendJson(response, 405, { error: 'METHOD_NOT_ALLOWED' })
    return
  }

  let body
  try {
    body = await readBody(request)
  } catch (error) {
    if (error?.code === 'BODY_TOO_LARGE') {
      sendJson(response, 413, { error: 'BODY_TOO_LARGE' })
      return
    }
    sendJson(response, 400, { error: 'INVALID_BODY' })
    return
  }

  let payload
  try {
    payload = JSON.parse(body)
  } catch {
    sendJson(response, 400, { error: 'INVALID_JSON' })
    return
  }

  if (typeof payload?.text !== 'string') {
    sendJson(response, 400, { error: 'TEXT_REQUIRED' })
    return
  }
  if (payload.text.length > MAX_TEXT_LENGTH) {
    sendJson(response, 413, { error: 'TEXT_TOO_LONG', maxTextLength: MAX_TEXT_LENGTH })
    return
  }

  try {
    sendJson(response, 200, analyze(payload.text))
  } catch (error) {
    sendJson(response, 500, { error: error instanceof Error ? error.message : 'ANALYSIS_FAILED' })
  }
}

/**
 * Register the local analysis route.
 * @param {object} ctx - host plugin context.
 */
export function apply (ctx) {
  ctx.inject(['webServer'], (webCtx) => {
    webCtx.effect(() => webCtx.webServer.register({
      kind: 'exact',
      path: ROUTE_PATH,
      handler,
    }), 'ielts-grammar: analysis route')
  })
}

export { handler as __handler, ROUTE_PATH }
