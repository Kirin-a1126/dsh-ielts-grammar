import assert from 'node:assert/strict'
import { test } from 'node:test'

import { analyze, editDistance, pluralize, articleFor } from '../lib/analyzer.js'

const SAMPLE = [
  'Nowadays, a lot of people thinks that technology is more better for education.',
  'In my opinion, I think this is a important question.',
  'The government should discuss about how to use technology in the classroom, and they should provide informations to students.',
  'However, there are many problem with this approach.',
  'For example, some students use their phones too much and this have a negative effect on their study.',
  'In conclusion, technology is very good, but we must also consider the disadvantages.',
].join(' ')

const CLEAN = [
  'Many people believe that technology has transformed education.',
  'In my view, this shift is largely beneficial, although it creates challenges for teachers.',
  'Governments should invest in training so that digital tools are used effectively.',
].join(' ')

function issuesByCode (result, code) {
  return result.grammar.filter((issue) => issue.code === code)
}

function applyAll (text, issues) {
  let output = text
  const ordered = [...issues].sort((a, b) => b.start - a.start)
  for (const issue of ordered) {
    if (issue.suggestions.length === 0) continue
    if (output.slice(issue.start, issue.end) !== issue.original) continue
    output = output.slice(0, issue.start) + issue.suggestions[0] + output.slice(issue.end)
  }
  return output
}

function assertNoOverlap (issues) {
  const ordered = [...issues].sort((a, b) => a.start - b.start)
  for (let index = 1; index < ordered.length; index += 1) {
    assert.ok(
      ordered[index].start >= ordered[index - 1].end,
      `issues overlap: ${ordered[index - 1].code} and ${ordered[index].code}`,
    )
  }
}

test('the sample draft exposes the intended teaching points', () => {
  const result = analyze(SAMPLE)
  const codes = new Set(result.grammar.map((issue) => issue.code))

  for (const code of [
    'subject-verb-plural',
    'double-comparative',
    'a-before-vowel',
    'opinion-redundant',
    'discuss-about',
    'uncountable-plural',
    'quantifier-singular-noun',
    'subject-verb-singular',
  ]) {
    assert.ok(codes.has(code), `expected rule ${code} to fire`)
  }

  assert.ok(result.stats.words > 60)
  assert.ok(result.stats.errors >= 5)
  assert.ok(result.stats.upgradeCount >= 5)
  assertNoOverlap(result.grammar)
  assertNoOverlap(result.upgrades)
})

test('all grammar replacements can be applied without corrupting the range model', () => {
  const result = analyze(SAMPLE)
  const corrected = applyAll(SAMPLE, result.grammar)

  assert.match(corrected, /people think/)
  assert.match(corrected, /is better for education/)
  assert.match(corrected, /an important question/)
  assert.match(corrected, /In my opinion, this is/)
  assert.match(corrected, /discuss how/)
  assert.match(corrected, /information to students/)
  assert.match(corrected, /many problems/)
  assert.match(corrected, /this has a negative effect/)
  assert.doesNotMatch(corrected, /informations/)
  assert.doesNotMatch(corrected, /more better/)
})

test('a clean paragraph does not produce grammar false alarms', () => {
  const result = analyze(CLEAN)
  assert.equal(result.grammar.length, 0, result.grammar.map((issue) => issue.code).join(', '))
  assert.ok(result.stats.grammarScore >= 90)
})

test('relative clauses and noun uses of verb forms are left alone', () => {
  const text = [
    'The reasons that are listed in the report are convincing.',
    'This show is popular with younger audiences.',
    'This use of public money deserves scrutiny.',
    'The evidence that was collected supports the claim.',
  ].join(' ')
  const result = analyze(text)
  assert.equal(result.grammar.filter((issue) => issue.category === 'agreement').length, 0)
})

test('articles cover vowel sounds, silent h and consonant sounds', () => {
  const text = [
    'This is a important issue.',
    'He is a engineer.',
    'She studies at an university.',
    'I waited a hour.',
    'He is teacher.',
    'A European city can be expensive.',
  ].join(' ')
  const result = analyze(text)
  const byCode = (code) => issuesByCode(result, code)

  assert.equal(byCode('a-before-vowel')[0]?.suggestions[0], 'an')
  assert.equal(byCode('a-before-vowel')[1]?.suggestions[0], 'an')
  assert.equal(byCode('missing-profession-article')[0]?.suggestions[0], 'a teacher')
  assert.equal(byCode('an-before-consonant-sound')[0]?.suggestions[0], 'a')
  assert.equal(byCode('a-before-silent-h')[0]?.suggestions[0], 'an')
  assert.equal(byCode('a-before-vowel').length, 2)
})

test('uncountable nouns and quantifiers are corrected', () => {
  const text = [
    'The government provided many informations and advices.',
    'She gave me an advice.',
    'There are less people today, and much students stayed at home.',
    'The amount of people in the survey was small.',
  ].join(' ')
  const result = analyze(text)

  assert.ok(issuesByCode(result, 'uncountable-plural').length >= 2)
  assert.ok(issuesByCode(result, 'uncountable-article')[0]?.suggestions.includes('advice'))
  assert.equal(issuesByCode(result, 'less-plural')[0]?.suggestions[0], 'fewer people')
  assert.equal(issuesByCode(result, 'much-plural')[0]?.suggestions[0], 'many students')
  assert.equal(issuesByCode(result, 'amount-of-countable')[0]?.suggestions[0], 'number')
})

test('there-be, one of and quantity patterns use the correct head noun', () => {
  const text = [
    'There is many reasons for this trend.',
    'One of the student is absent.',
    'One of the students are ready.',
    'The number of people are rising.',
    'A number of people is affected.',
    'Many problem remain unsolved.',
  ].join(' ')
  const result = analyze(text)

  assert.equal(issuesByCode(result, 'there-is-plural')[0]?.suggestions[0], 'are')
  assert.equal(issuesByCode(result, 'one-of-singular-noun')[0]?.suggestions[0], 'students')
  assert.equal(issuesByCode(result, 'one-of-plural-verb')[0]?.suggestions[0], 'is')
  assert.equal(issuesByCode(result, 'the-number-of')[0]?.suggestions[0], 'is')
  assert.equal(issuesByCode(result, 'a-number-of')[0]?.suggestions[0], 'are')
  assert.equal(issuesByCode(result, 'quantifier-singular-noun')[0]?.suggestions[0], 'problems')
})

test('common preposition and verb-pattern errors are fixed safely', () => {
  const text = [
    'The essay discusses about the issue.',
    'It depends of the context.',
    'She is capable to lead the team.',
    'I am agree with this view.',
    'They should explain me the policy.',
    'Although it is costly, but it is effective.',
  ].join(' ')
  const result = analyze(text)

  assert.ok(issuesByCode(result, 'discuss-about').length === 1)
  assert.ok(issuesByCode(result, 'depend-of').length === 1)
  assert.ok(issuesByCode(result, 'capable-to').length === 1)
  assert.ok(issuesByCode(result, 'be-agree').length === 1)
  assert.ok(issuesByCode(result, 'verb-to-person').length === 1)
  const although = issuesByCode(result, 'although-but')[0]
  assert.ok(although)
  assert.equal(although.suggestions[0], '')

  const corrected = applyAll(text, result.grammar)
  assert.match(corrected, /discusses the issue/)
  assert.match(corrected, /depends on the context/)
  assert.match(corrected, /capable of leading/)
  assert.match(corrected, /I agree with/)
  assert.match(corrected, /explain to me/)
  assert.match(corrected, /Although it is costly, it is effective\./)
})

test('lexical upgrades are contextual and never overlap a grammar fix', () => {
  const result = analyze(SAMPLE)
  const upgradeOriginals = result.upgrades.map((upgrade) => upgrade.original.toLowerCase())

  assert.ok(upgradeOriginals.includes('nowadays'))
  assert.ok(upgradeOriginals.includes('a lot of'))
  assert.ok(upgradeOriginals.includes('very good'))
  assert.ok(!upgradeOriginals.includes('in my opinion'), 'the redundant opinion frame owns that span')
  assert.ok(!upgradeOriginals.includes('good'), 'very good owns the adjective span')
  assert.ok(result.upgrades.every((upgrade) => upgrade.alternatives.length > 0))
  assert.ok(result.upgrades.every((upgrade) => upgrade.criterion === 'LR'))
})

test('repeated content words get an upgrade hint when one exists', () => {
  const text = 'Technology shapes education. Technology also shapes work. Technology can connect people.'
  const result = analyze(text)
  const technology = result.repeated.find((entry) => entry.term === 'technology')
  assert.ok(technology)
  assert.equal(technology.count, 3)
  assert.ok(technology.alternatives.includes('technological innovation'))
})

test('stats and helpers behave at the boundaries', () => {
  assert.equal(pluralize('country'), 'countries')
  assert.equal(pluralize('child'), 'children')
  assert.equal(articleFor('engineer'), 'an')
  assert.equal(articleFor('university'), 'a')

  const empty = analyze('')
  assert.equal(empty.stats.words, 0)
  assert.equal(empty.stats.grammarScore, null)
  assert.deepEqual(empty.grammar, [])

  assert.throws(() => analyze('x'.repeat(20001)), /TEXT_TOO_LONG/)
  assert.throws(() => analyze(null), /text must be a string/)
})

test('the general dictionary catches misspellings outside the curated list', () => {
  const text = 'The importent decision shoud protec the enviroment, but the speling was bad. Importent policies also matter.'
  const result = analyze(text)
  const general = issuesByCode(result, 'spelling-dictionary')
  const byWord = Object.fromEntries(general.map((issue) => [issue.original, issue.suggestions]))

  assert.equal(byWord.importent[0], 'important')
  assert.equal(byWord.Importent[0], 'Important')
  assert.equal(byWord.shoud[0], 'should')
  assert.equal(byWord.protec[0], 'protect')
  assert.equal(byWord.speling[0], 'spelling')
  assert.equal(editDistance('teh', 'the'), 1)
  assert.equal(editDistance('shoud', 'should'), 1)
})

test('British and American spellings and proper nouns do not raise spelling alarms', () => {
  const text = [
    'I use colour and organise the centre.',
    'The color and organize variant is also accepted.',
    'London and Microsoft announced a blockchain initiative.',
    'Paris and Australia are mentioned alongside Zephyria.',
    'Biodiversity and decarbonisation are valid topic terms.',
  ].join(' ')
  const result = analyze(text)
  assert.equal(result.grammar.filter((issue) => issue.category === 'spelling').length, 0)
})

test('first-person I takes the base verb, including irregular forms', () => {
  const text = 'I needs to know. I has a question. I is ready. I studies English and I goes home. If I were you, I would wait.'
  const result = analyze(text)
  const firstPerson = issuesByCode(result, 'subject-verb-first-person')
  const suggestions = Object.fromEntries(firstPerson.map((issue) => [issue.original, issue.suggestions[0]]))

  assert.equal(suggestions.needs, 'need')
  assert.equal(suggestions.has, 'have')
  assert.equal(suggestions.is, 'am')
  assert.equal(suggestions.studies, 'study')
  assert.equal(suggestions.goes, 'go')
  assert.equal(firstPerson.length, 5)
  assert.equal(result.grammar.filter((issue) => issue.original === 'were').length, 0)
  assert.equal(result.grammar.filter((issue) => issue.original === 'would').length, 0)
})

test('third-person singular pronouns require the -s verb form', () => {
  const text = 'She need to know. He want to go. She study English. Does she need to know? She need not worry. This need is urgent. She needs to know.'
  const result = analyze(text)
  const issues = issuesByCode(result, 'subject-verb-third-person-base')
  const suggestions = Object.fromEntries(issues.map((issue) => [issue.original, issue.suggestions[0]]))

  assert.equal(suggestions.need, 'needs')
  assert.equal(suggestions.want, 'wants')
  assert.equal(suggestions.study, 'studies')
  assert.equal(issues.length, 3)
  assert.equal(result.grammar.filter((issue) => issue.code !== 'subject-verb-third-person-base').length, 0)
})

test('relative clauses and not only … but also … are checked', () => {
  const text = "Many experts, who argues that excessive reliance may cause problems, believes that the negative consequences will not only affect individuals who lacks digital skills, but also creates challenges."
  const result = analyze(text)
  const byWord = Object.fromEntries(result.grammar.map((issue) => [issue.original, issue]))

  assert.equal(byWord.argues?.suggestions[0], 'argue')
  assert.equal(byWord.argues?.code, 'plural-relative-verb')
  assert.equal(byWord.believes?.suggestions[0], 'believe')
  assert.equal(byWord.believes?.code, 'plural-relative-main-verb')
  assert.equal(byWord.lacks?.suggestions[0], 'lack')
  assert.equal(byWord.creates?.suggestions[0], 'create')
  assert.equal(byWord.creates?.code, 'not-only-but-also-parallel')

  const clean = analyze('Many experts, who argue that technology matters, believe that policy should change. The policy will not only affect workers but also create problems.')
  assert.equal(clean.grammar.length, 0)
})

test('every issue exposes a stable bilingual shape for the UI', () => {
  const result = analyze(SAMPLE)
  for (const issue of result.grammar) {
    assert.equal(typeof issue.message.zh, 'string')
    assert.equal(typeof issue.message.en, 'string')
    assert.equal(typeof issue.explanation.zh, 'string')
    assert.equal(typeof issue.explanation.en, 'string')
    assert.ok(issue.start < issue.end)
    assert.ok(Array.isArray(issue.suggestions))
  }
})
