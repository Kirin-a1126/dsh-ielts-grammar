import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

import { analyze } from '../lib/analyzer.js'

let bundle

globalThis.window = {
  __ModuleLoader__: {
    load (options) {
      bundle = options
    },
  },
  localStorage: {
    store: new Map(),
    getItem (key) { return this.store.has(key) ? this.store.get(key) : null },
    setItem (key, value) { this.store.set(key, String(value)) },
  },
  setTimeout: (fn) => 0,
  clearTimeout: () => {},
  requestAnimationFrame: (fn) => fn(),
  fetch: async () => ({ ok: true, json: async () => ({}) }),
}

globalThis.document = {
  getElementById: () => null,
  createElement: () => ({ remove () {} }),
  head: { appendChild () {} },
}

await import('../lib/client.js')

const fakeReact = {
  createElement: (type, props, ...children) => ({
    type,
    props: props ?? {},
    children: children.flat(Infinity),
  }),
  useState: (initial) => [typeof initial === 'function' ? initial() : initial, () => {}],
  useEffect: () => {},
  useRef: (value) => ({ current: value }),
  Fragment: 'Fragment',
}

function load () {
  return bundle.factory((specifier) => {
    if (specifier === 'react') return fakeReact
    throw new Error(`unexpected require: ${specifier}`)
  })
}

function makeContext () {
  const locales = []
  const registrations = []
  const injections = []
  const effects = []
  const ctx = {
    effect (body, label) {
      effects.push(label)
      return body()
    },
    locale: {
      bind: () => (key) => load().__test.EN[key] ?? key,
      register (namespace, locale, dict) {
        locales.push({ namespace, locale, dict })
        return () => {}
      },
      subscribe: () => () => {},
      getLocale: () => ({ active: 'en' }),
    },
    slots: {
      inject (slot, callback) {
        injections.push(slot)
        callback()
      },
      register (definition, component) {
        registrations.push({ definition, component })
        return () => {}
      },
    },
  }
  return { ctx, locales, registrations, injections, effects }
}

function walk (node, out) {
  if (node === null || node === undefined || typeof node === 'boolean') return
  if (Array.isArray(node)) {
    node.forEach((child) => walk(child, out))
    return
  }
  if (typeof node === 'object') {
    out.push(node)
    walk(node.children, out)
  }
}

const collect = (tree) => {
  const out = []
  walk(tree, out)
  return out
}

const gatherText = (node) => {
  const out = []
  const visit = (value) => {
    if (typeof value === 'string' || typeof value === 'number') out.push(String(value))
    else if (Array.isArray(value)) value.forEach(visit)
    else if (value && typeof value === 'object') visit(value.children)
  }
  visit(node)
  return out
}

test('the client bundle exposes the sidebar entry and its matching main panel', () => {
  const mod = load()
  assert.equal(mod.PANEL_ID, 'ielts-grammar')
  assert.equal(mod.ROUTE, '/dsh-ielts-grammar/analyze')
  assert.deepEqual(mod.inject, ['slots', 'locale'])

  const { ctx, locales, registrations, injections } = makeContext()
  mod.apply(ctx)

  assert.deepEqual(injections.sort(), ['main', 'sidebar.panellist'])
  const sidebar = registrations.find((entry) => entry.definition.name === 'sidebar.panellist')
  assert.equal(sidebar.definition.id, 'ielts-grammar')
  assert.equal(sidebar.definition.order, 31)
  assert.equal(sidebar.definition.label(), 'IELTS Grammar')
  assert.equal(typeof sidebar.component, 'function')

  const main = registrations.find((entry) => entry.definition.name === 'main')
  assert.equal(main.definition.key, 'ielts-grammar')
  assert.equal(typeof main.component, 'function')

  assert.deepEqual(locales.map((entry) => entry.locale), ['en', 'zh', 'zh-CN'])
  assert.equal(locales[0].namespace, 'ieltsGrammar')
  assert.equal(locales[1].dict['sidebar.label'], '雅思语法')
})

test('English and Chinese dictionaries cover exactly the same keys', () => {
  const { EN, ZH } = load().__test
  assert.deepEqual(Object.keys(EN).sort(), Object.keys(ZH).sort())
  for (const value of Object.values(EN)) assert.ok(value.length > 0)
  for (const value of Object.values(ZH)) assert.ok(value.length > 0)

  const source = readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8')
  const staticKeys = new Set([...source.matchAll(/\bt\('([^']+)'/g)].map((match) => match[1]))
  for (const key of staticKeys) {
    assert.ok(Object.prototype.hasOwnProperty.call(EN, key), `missing English locale key: ${key}`)
    assert.ok(Object.prototype.hasOwnProperty.call(ZH, key), `missing Chinese locale key: ${key}`)
  }
  for (const category of ['spelling', 'mechanics', 'agreement', 'article', 'preposition', 'uncountable', 'redundancy', 'word-form', 'conjunction', 'style']) {
    assert.ok(EN[`category.${category}`], `missing category label: ${category}`)
  }
})

test('the panel renders its onboarding state with an editor and sample action', () => {
  const { Panel } = load().__test
  window.localStorage.store.clear()
  const tree = Panel()
  const elements = collect(tree)
  const text = gatherText(tree)

  assert.ok(elements.some((element) => element.type === 'textarea'))
  assert.ok(elements.some((element) => element.props?.title === 'Check grammar. Lift your lexis.'))
  assert.ok(text.includes('Try the sample draft'))
  assert.ok(text.includes('Grammar & Lexis Studio'))
  assert.equal(elements.find((element) => element.type === 'textarea').props.value, '')
})

test('a restored draft is placed in the editor without an empty overwrite', () => {
  const { Panel } = load().__test
  window.localStorage.store.set('dsh-ielts-grammar:draft', 'A restored draft.')
  const tree = Panel()
  const elements = collect(tree)
  const textarea = elements.find((element) => element.type === 'textarea')
  assert.equal(textarea.props.value, 'A restored draft.')
})

test('the sidebar icon renders at the requested size', () => {
  const { Icon } = load().__test
  const tree = Icon({ size: 18, active: true })
  assert.equal(tree.type, 'svg')
  assert.equal(tree.props.width, 18)
  assert.equal(tree.props.height, 18)
})

test('context snippets highlight only the exact issue range', () => {
  const { makeContext } = load().__test
  const text = 'The government should discuss about the issue.'
  const start = text.indexOf('discuss')
  const end = start + 'discuss'.length
  const context = makeContext(text, start, end)
  assert.equal(context.match, 'discuss')
  assert.match(context.before, /should $/)
  assert.match(context.after, /^ about/)
})

test('small pure helpers report words and health tones', () => {
  const { countWords, healthTone } = load().__test
  assert.equal(countWords('One two three.'), 3)
  assert.equal(countWords('Well-known 2025 goals.'), 3)
  assert.equal(healthTone(null), 'idle')
  assert.equal(healthTone(90), 'ok')
  assert.equal(healthTone(70), 'warn')
  assert.equal(healthTone(30), 'error')
})

test('grammar and upgrade cards render their context, suggestions and bands', () => {
  const { IssueCard, UpgradeCard } = load().__test
  const text = 'Nowadays, a lot of people thinks that technology is more better.'
  const report = analyze(text)
  const issue = report.grammar.find((entry) => entry.code === 'subject-verb-plural')
  const upgrade = report.upgrades.find((entry) => entry.term === 'nowadays')
  assert.ok(issue)
  assert.ok(upgrade)

  const issueTree = IssueCard({
    issue,
    text,
    active: false,
    onLocate: () => {},
    onApply: () => {},
  })
  const issueElements = collect(issueTree)
  const issueText = gatherText(issueTree)
  assert.ok(issueText.includes(issue.message.en))
  assert.ok(issueElements.some((element) => element.type === 'mark'))
  assert.ok(issueElements.filter((element) => element.type === 'button').some((button) => (
    gatherText(button).includes('think')
  )))

  const upgradeTree = UpgradeCard({
    upgrade,
    text,
    onLocate: () => {},
    onApply: () => {},
  })
  const upgradeText = gatherText(upgradeTree)
  assert.ok(upgradeText.includes('In contemporary society'))
  assert.ok(upgradeText.includes('B8'))
  assert.ok(upgradeText.includes('At present'))
})
