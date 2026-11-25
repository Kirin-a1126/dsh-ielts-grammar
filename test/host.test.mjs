import assert from 'node:assert/strict'
import { Readable } from 'node:stream'
import { test } from 'node:test'

import { __handler, ROUTE_PATH } from '../lib/index.js'

function request (method, body) {
  const stream = Readable.from(body === undefined ? [] : [Buffer.from(body, 'utf8')])
  stream.method = method
  stream.url = ROUTE_PATH
  return stream
}

function response () {
  return {
    statusCode: 0,
    headers: {},
    body: '',
    writeHead (status, headers) {
      this.statusCode = status
      this.headers = headers
    },
    end (body) {
      this.body = body
    },
  }
}

const json = (res) => JSON.parse(res.body)

test('the local analysis route accepts a POST and returns the report', async () => {
  const res = response()
  await __handler(request('POST', JSON.stringify({ text: 'He is teacher.' })), res)
  assert.equal(res.statusCode, 200)
  assert.equal(res.headers['content-type'], 'application/json; charset=utf-8')
  const payload = json(res)
  assert.equal(payload.stats.words, 3)
  assert.ok(payload.grammar.some((issue) => issue.code === 'missing-profession-article'))
})

test('the route rejects other methods and malformed payloads', async () => {
  const get = response()
  await __handler(request('GET'), get)
  assert.equal(get.statusCode, 405)

  const malformed = response()
  await __handler(request('POST', '{nope'), malformed)
  assert.equal(malformed.statusCode, 400)
  assert.equal(json(malformed).error, 'INVALID_JSON')

  const missing = response()
  await __handler(request('POST', JSON.stringify({ draft: 'hello' })), missing)
  assert.equal(missing.statusCode, 400)
  assert.equal(json(missing).error, 'TEXT_REQUIRED')
})

test('the route enforces the text limit', async () => {
  const res = response()
  await __handler(request('POST', JSON.stringify({ text: 'x'.repeat(20001) })), res)
  assert.equal(res.statusCode, 413)
  assert.equal(json(res).error, 'TEXT_TOO_LONG')
  assert.equal(json(res).maxTextLength, 20000)
})
