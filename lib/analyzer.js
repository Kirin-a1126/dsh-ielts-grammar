/**
 * Deterministic IELTS grammar and lexical analyser.
 *
 * The analyser returns character ranges so the browser can replace exactly the
 * problematic span and re-run the check. It intentionally favours high-confidence,
 * high-frequency IELTS errors over exhaustive parsing: a false alarm is more
 * expensive to a learner than a missed edge case.
 *
 * @module dsh-ielts-grammar/analyzer
 */

import dictionaryEn from 'dictionary-en'
import dictionaryEnGb from 'dictionary-en-gb'
import nspell from 'nspell'

import {
  NOTE_DEFAULT,
  REASON_DEFAULTS,
  UPGRADE_ENTRIES,
  UPGRADE_INDEX,
} from './lexicon.js'

export const MAX_TEXT_LENGTH = 20000
const MAX_UPGRADE_CARDS = 60
const MAX_UPGRADES_PER_TERM = 2
const MAX_REPEATED_WORDS = 6

const msg = (zh, en) => ({ zh, en })
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Preserve sentence-initial capitalisation when applying a replacement. */
export function matchCase (original, replacement) {
  if (replacement === '') return ''
  const letters = original.match(/[A-Za-z]/)
  if (letters === null) return replacement
  if (letters[0] === letters[0].toUpperCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1)
  }
  return replacement
}

const IRREGULAR_PLURALS = {
  person: 'people',
  child: 'children',
  man: 'men',
  woman: 'women',
  foot: 'feet',
  tooth: 'teeth',
  mouse: 'mice',
  goose: 'geese',
}

export function pluralize (word) {
  const lower = word.toLowerCase()
  if (IRREGULAR_PLURALS[lower] !== undefined) return IRREGULAR_PLURALS[lower]
  if (/(?:s|x|z|ch|sh)$/i.test(lower)) return `${word}es`
  if (/[^aeiou]y$/i.test(lower)) return `${word.slice(0, -1)}ies`
  return `${word}s`
}

export function articleFor (word) {
  if (/^(?:hour|honest|honour|honor|heir)\b/i.test(word)) return 'an'
  if (/^(?:uni|use|user|usual|unique|unit|unite|union|universal|uniform|unanimous|ubiquit|euro|eulog|euphem|euph|one\b|once\b|utili|uran|ure|ewe|ukulele|ufo)/i.test(word)) return 'a'
  return /^[aeiou]/i.test(word) ? 'an' : 'a'
}

/** Convert a base verb to its -ing form for the capable of doing pattern. */
export function toGerund (verb) {
  const lower = verb.toLowerCase()
  if (/ie$/.test(lower)) return `${verb.slice(0, -2)}ying`
  if (/[^e]e$/.test(lower)) return `${verb.slice(0, -1)}ing`
  if (/^(?:run|stop|plan|get|sit|put|begin|prefer|refer|admit|commit|control|occur|regret)$/.test(lower)) {
    return `${verb}${verb.slice(-1)}ing`
  }
  return `${verb}ing`
}

const SPELLINGS = {
  enviroment: 'environment',
  enviromental: 'environmental',
  goverment: 'government',
  goverments: 'governments',
  benifit: 'benefit',
  benifits: 'benefits',
  developement: 'development',
  sucess: 'success',
  succesful: 'successful',
  oppurtunity: 'opportunity',
  responsability: 'responsibility',
  responsibilty: 'responsibility',
  knowlege: 'knowledge',
  technolgy: 'technology',
  tecnology: 'technology',
  wich: 'which',
  thier: 'their',
  recieve: 'receive',
  seperate: 'separate',
  occured: 'occurred',
  neccessary: 'necessary',
  accomodation: 'accommodation',
  commitee: 'committee',
  definately: 'definitely',
  alot: 'a lot',
  untill: 'until',
  becuase: 'because',
  becasue: 'because',
  therfore: 'therefore',
  howerver: 'however',
  arguement: 'argument',
  concious: 'conscious',
  beleive: 'believe',
  acheive: 'achieve',
  adress: 'address',
  wierd: 'weird',
  thourough: 'thorough',
  occurance: 'occurrence',
  independant: 'independent',
  existance: 'existence',
  maintainance: 'maintenance',
  priviledge: 'privilege',
  questionaire: 'questionnaire',
  refered: 'referred',
  reguardless: 'regardless',
  similiar: 'similar',
  tommorow: 'tomorrow',
  truely: 'truly',
  higer: 'higher',
  lowr: 'lower',
  quantaty: 'quantity',
  qualaty: 'quality',
}

const SPELLING_RE = new RegExp(
  `\\b(${Object.keys(SPELLINGS).sort((a, b) => b.length - a.length).map(escapeRegExp).join('|')})\\b`,
  'dgi',
)

// Both dictionaries are loaded so British and American spellings are accepted.
// nspell resolves affixes and generates suggestions from the Hunspell data.
const US_SPELL = nspell(dictionaryEn)
const GB_SPELL = nspell(dictionaryEnGb)

// Product names, abbreviations and topic terms that are valid even when a
// general dictionary lacks them. Capitalised words are skipped separately.
const SPELL_ALLOWLIST = new Set([
  'benefitted', 'biodiversity', 'blockchain', 'cyberbullying', 'cybersecurity',
  'cryptocurrency', 'cryptocurrencies', 'decarbonisation', 'decarbonization',
  'decarbonise', 'decarbonize', 'decarbonising', 'decarbonizing',
  'digitalisation', 'digitalization', 'ecommerce', 'elearning', 'globalisation',
  'globalization', 'internet', 'lockdown', 'microplastic', 'microplastics',
  'multicultural', 'multiculturalism', 'nanotechnology', 'online', 'podcast',
  'podcasts', 'reskilling', 'smartphone', 'smartphones', 'socioeconomic',
  'sustainability', 'telecommuting', 'telemedicine', 'telework', 'teleworking',
  'upskilling', 'urbanisation', 'urbanization', 'wellbeing',
])

// A few high-frequency corrections deserve first place even when nspell's
// heuristic returns a rarer word at the same edit distance.
const PREFERRED_SUGGESTIONS = new Set([
  'should', 'could', 'would', 'their', 'there', 'which', 'because',
  'important', 'government', 'environment', 'receive', 'separate',
  'definitely', 'necessary', 'success', 'opportunity', 'responsibility',
  'knowledge', 'development', 'accommodation', 'tomorrow', 'believe',
  'achieve', 'similar', 'independent', 'maintenance', 'questionnaire',
  'privilege', 'occurrence', 'thorough', 'weird', 'address', 'argument',
  'technology', 'people', 'education', 'children', 'information', 'spelling',
  'society', 'student', 'students', 'school', 'university', 'research',
  'evidence', 'example', 'reason', 'effect', 'impact', 'policy', 'health',
  'crime', 'poverty', 'economy', 'culture', 'tradition', 'family', 'parent',
  'parents', 'pollution', 'advantage', 'disadvantage', 'benefit', 'problem',
  'solution', 'increase', 'decrease',
])

/**
 * Optimal-string-alignment edit distance (adjacent transpositions cost one).
 * Exported for tests and for ranking dictionary suggestions.
 */
export function editDistance (left, right) {
  const a = left.toLowerCase()
  const b = right.toLowerCase()
  const rows = a.length + 1
  const cols = b.length + 1
  const dp = Array.from({ length: rows }, (_, row) => {
    const line = new Array(cols).fill(0)
    line[0] = row
    return line
  })
  for (let col = 0; col < cols; col += 1) dp[0][col] = col
  for (let row = 1; row < rows; row += 1) {
    for (let col = 1; col < cols; col += 1) {
      const cost = a[row - 1] === b[col - 1] ? 0 : 1
      dp[row][col] = Math.min(
        dp[row - 1][col] + 1,
        dp[row][col - 1] + 1,
        dp[row - 1][col - 1] + cost,
      )
      if (
        row > 1 && col > 1 &&
        a[row - 1] === b[col - 2] &&
        a[row - 2] === b[col - 1]
      ) {
        dp[row][col] = Math.min(dp[row][col], dp[row - 2][col - 2] + 1)
      }
    }
  }
  return dp[a.length][b.length]
}

function isKnownSpelling (word) {
  if (SPELL_ALLOWLIST.has(word)) return true
  return US_SPELL.correct(word) || GB_SPELL.correct(word)
}

function isSentenceStart (source, index) {
  const before = source.slice(0, index)
  const trimmed = before.replace(/[\s"'“”‘’(\[]+$/, '')
  return trimmed === '' || /[.!?]$/.test(trimmed) || /\n\s*$/.test(before)
}

function spellingSuggestions (word) {
  const maxDistance = word.length >= 8 ? 2 : 1
  const candidates = new Map()
  let rank = 0
  for (const engine of [GB_SPELL, US_SPELL]) {
    for (const suggestion of engine.suggest(word)) {
      const candidate = suggestion.toLowerCase()
      rank += 1
      if (!/^[a-z]+$/.test(candidate) || candidate === word || candidate.length < 3) continue
      const distance = editDistance(word, candidate)
      if (distance > maxDistance) continue
      const current = candidates.get(candidate)
      const entry = {
        text: candidate,
        distance,
        preferred: PREFERRED_SUGGESTIONS.has(candidate) ? 0 : 1,
        rank,
      }
      if (
        current === undefined ||
        entry.distance < current.distance ||
        (entry.distance === current.distance && entry.preferred < current.preferred) ||
        (entry.distance === current.distance && entry.preferred === current.preferred && entry.rank < current.rank)
      ) {
        candidates.set(candidate, entry)
      }
    }
  }
  return [...candidates.values()]
    .sort((a, b) => a.distance - b.distance || a.preferred - b.preferred || a.rank - b.rank)
    .slice(0, 4)
    .map((entry) => entry.text)
}

const SINGULAR_SUBJECTS = [
  'he', 'she', 'it', 'this', 'everyone', 'everybody', 'someone',
  'somebody', 'anyone', 'anybody', 'nobody', 'neither', 'either', 'each',
]

// Deliberately excludes verb forms that are also common nouns after "this"
// (show, use, help, play, need, want) to avoid flagging noun phrases.
const SINGULAR_VERB_FIX = {
  are: 'is',
  were: 'was',
  have: 'has',
  do: 'does',
  go: 'goes',
  make: 'makes',
  take: 'takes',
  seem: 'seems',
  suggest: 'suggests',
  argue: 'argues',
  believe: 'believes',
  think: 'thinks',
}

const SINGULAR_SUBJECT_RE = new RegExp(
  `\\b(${SINGULAR_SUBJECTS.join('|')})\\s+(${Object.keys(SINGULAR_VERB_FIX).join('|')})\\b`,
  'dgi',
)

const PLURAL_SUBJECTS = [
  'they', 'we', 'you', 'people', 'children', 'students', 'governments',
  'companies', 'individuals', 'citizens', 'parents', 'teachers', 'workers',
  'countries', 'societies', 'technologies', 'problems', 'solutions',
  'benefits', 'drawbacks', 'advantages', 'disadvantages', 'factors',
  'reasons', 'effects', 'consequences', 'resources', 'jobs', 'families',
  'communities', 'authorities', 'policymakers', 'youngsters', 'adults',
  'employees', 'consumers', 'researchers', 'scientists', 'men', 'women',
  'these', 'those', 'many', 'few', 'several', 'both',
]

const PLURAL_VERB_FIX = {
  is: 'are',
  was: 'were',
  has: 'have',
  does: 'do',
  goes: 'go',
  makes: 'make',
  takes: 'take',
  thinks: 'think',
  believes: 'believe',
  argues: 'argue',
  claims: 'claim',
  states: 'state',
  says: 'say',
  shows: 'show',
  suggests: 'suggest',
  indicates: 'indicate',
  demonstrates: 'demonstrate',
  plays: 'play',
  needs: 'need',
  wants: 'want',
  uses: 'use',
  helps: 'help',
}

const PLURAL_SUBJECT_RE = new RegExp(
  `\\b(${PLURAL_SUBJECTS.join('|')})\\s+(${Object.keys(PLURAL_VERB_FIX).join('|')})\\b`,
  'dgi',
)

// "I" takes the base verb, not a third-person singular form. This is separate
// from the plural-subject rule above because it also has irregular forms:
// I is -> I am, I has -> I have.
const FIRST_PERSON_VERB_FIX = {
  is: 'am',
  are: 'am',
  has: 'have',
  does: 'do',
  goes: 'go',
  needs: 'need',
  wants: 'want',
  thinks: 'think',
  believes: 'believe',
  knows: 'know',
  likes: 'like',
  lives: 'live',
  works: 'work',
  studies: 'study',
  tries: 'try',
  watches: 'watch',
  plays: 'play',
  says: 'say',
  shows: 'show',
  suggests: 'suggest',
  argues: 'argue',
  claims: 'claim',
  states: 'state',
  takes: 'take',
  makes: 'make',
  gets: 'get',
  uses: 'use',
  helps: 'help',
  feels: 'feel',
  seems: 'seem',
  looks: 'look',
  comes: 'come',
  becomes: 'become',
  means: 'mean',
  keeps: 'keep',
  finds: 'find',
  gives: 'give',
  tells: 'tell',
  asks: 'ask',
  calls: 'call',
  moves: 'move',
  starts: 'start',
  stops: 'stop',
  changes: 'change',
  creates: 'create',
  provides: 'provide',
  requires: 'require',
  allows: 'allow',
  improves: 'improve',
  reduces: 'reduce',
  causes: 'cause',
  leads: 'lead',
  offers: 'offer',
  includes: 'include',
  considers: 'consider',
  supports: 'support',
  develops: 'develop',
  achieves: 'achieve',
  focuses: 'focus',
  applies: 'apply',
  relies: 'rely',
  depends: 'depend',
  contributes: 'contribute',
  affects: 'affect',
  influences: 'influence',
}

const FIRST_PERSON_SUBJECT_RE = new RegExp(
  `\\bI\\s+(${Object.keys(FIRST_PERSON_VERB_FIX).join('|')})\\b`,
  'dg',
)

// Third-person singular pronouns followed by a base verb: she need -> she needs.
// "this" is deliberately excluded because "this need" can be a noun phrase.
const THIRD_PERSON_BASE_SUBJECTS = [
  'he', 'she', 'it', 'everyone', 'everybody', 'someone',
  'somebody', 'anyone', 'anybody', 'nobody', 'neither', 'either',
]

const THIRD_PERSON_BASE_FIX = {
  need: 'needs',
  want: 'wants',
  know: 'knows',
  feel: 'feels',
  like: 'likes',
  live: 'lives',
  work: 'works',
  study: 'studies',
  watch: 'watches',
  play: 'plays',
  say: 'says',
  show: 'shows',
  help: 'helps',
  use: 'uses',
  get: 'gets',
  look: 'looks',
  come: 'comes',
  become: 'becomes',
  mean: 'means',
  keep: 'keeps',
  find: 'finds',
  give: 'gives',
  tell: 'tells',
  ask: 'asks',
  call: 'calls',
  move: 'moves',
  start: 'starts',
  stop: 'stops',
  change: 'changes',
  create: 'creates',
  provide: 'provides',
  require: 'requires',
  allow: 'allows',
  improve: 'improves',
  reduce: 'reduces',
  cause: 'causes',
  lead: 'leads',
  offer: 'offers',
  include: 'includes',
  consider: 'considers',
  support: 'supports',
  develop: 'develops',
  achieve: 'achieves',
  focus: 'focuses',
  apply: 'applies',
  rely: 'relies',
  depend: 'depends',
  contribute: 'contributes',
  affect: 'affects',
  influence: 'influences',
}

const THIRD_PERSON_BASE_RE = new RegExp(
  `\\b(${THIRD_PERSON_BASE_SUBJECTS.join('|')})\\s+(${Object.keys(THIRD_PERSON_BASE_FIX).join('|')})\\b`,
  'dgi',
)

const AUXILIARY_BEFORE_SUBJECT_RE = /\b(?:does|did|do|will|would|can|could|should|may|might|must|has|have|had|is|are|was|were)\s+$/i

const PLURAL_QUANTIFIERS = 'many|several|numerous|various|multiple|a number of|a lot of|lots of'
const PLURAL_NOUNS_FOR_BE = 'people|children|students|governments|companies|individuals|citizens|problems|solutions|benefits|drawbacks|advantages|disadvantages|factors|reasons|effects|consequences|jobs|countries|societies'
const THERE_QUANTIFIER_RE = new RegExp(`\\bthere\\s+(is|was)\\s+(?:${PLURAL_QUANTIFIERS})\\b`, 'dgi')
const THERE_NOUN_RE = new RegExp(`\\bthere\\s+(is|was)\\s+(?:${PLURAL_NOUNS_FOR_BE})\\b`, 'dgi')

const COUNTABLE_PLURALS = [
  'people', 'students', 'children', 'individuals', 'citizens', 'workers',
  'companies', 'countries', 'governments', 'problems', 'solutions',
  'benefits', 'drawbacks', 'advantages', 'disadvantages', 'jobs', 'cars',
  'resources', 'factors', 'reasons', 'effects', 'opportunities', 'families',
  'employees', 'consumers', 'teachers', 'parents', 'youngsters', 'adults',
  'households', 'respondents', 'participants', 'vehicles', 'cities',
]

const AN_NOUNS = [
  'apple', 'idea', 'example', 'issue', 'increase', 'effect', 'advantage',
  'argument', 'answer', 'essay', 'opinion', 'opportunity', 'individual',
  'industry', 'impact', 'approach', 'area', 'activity', 'action', 'environment',
  'education', 'economy', 'academic', 'additional', 'alternative', 'ancient',
  'annual', 'appropriate', 'article', 'artist', 'authority', 'average', 'exam',
  'economic', 'environmental', 'ethical', 'event', 'exact', 'existing',
  'expensive', 'experienced', 'external', 'extreme', 'immediate', 'impossible',
  'important', 'informative', 'initial', 'innovative', 'interesting', 'internal',
  'international', 'invaluable', 'obvious', 'official', 'ordinary', 'original',
  'overall', 'unfair', 'urgent', 'unusual', 'effective', 'efficient',
  'essential', 'entire', 'equal', 'enormous', 'enthusiastic', 'aging', 'ageing',
  'old', 'only', 'open', 'online', 'orange', 'urban', 'unemployed',
  'underlying', 'unexpected', 'unhealthy', 'illness', 'emergency', 'engineer',
  'officer',
]
const AN_NOUN_RE = new RegExp(`\\b(a)\\s+(${AN_NOUNS.join('|')})\\b`, 'dgi')
const SILENT_H_RE = /\b(a)\s+(hour|honest|honour|honor|heir)\b/dgi

const AN_EXCEPTION_RE = /\b(an)\s+(university|unique|useful|user|usual|uniform|union|unit|united|universal|unanimous|ubiquitous|european|one|once|ufo|ewe|eulogy|euphemism|euro|utensil|utopia|utility|urine)\b/dgi
const AN_CONSONANT_RE = /\b(an)\s+(car|house|book|person|student|problem|reason|way|year|day|government|company|job|child|country|city|system|fact|teacher|worker|family|school|policy|benefit|drawback|solution|technology)\b/dgi

const PROFESSION_RE = /\b(is|are|was|were|be|become|becomes|became)\s+(teacher|doctor|lawyer|engineer|nurse|scientist|researcher|manager|politician|journalist|writer|artist|farmer|driver)\b(?![-\w]|\s+(?:training|education|union|association|recruitment|shortage|salary|pay|profession|workforce|retention|morale|body|council|loan|visa|debt))/dgi

const ONE_OF_PLURAL_RE = /\bone\s+of\s+the\s+([a-z]+(?:s|ies)|children|people|men|women)\s+(are|were|have)\b/dgi
const ONE_OF_SINGULAR_RE = /\bone\s+of\s+the\s+([a-z]+)\b(?!\s+(?:body|population|group|union|organisation|organization|team|committee))/dgi
const ONE_OF_SINGULAR_NOUNS = new Set([
  'student', 'teacher', 'reason', 'factor', 'advantage', 'disadvantage',
  'problem', 'benefit', 'drawback', 'company', 'country', 'person', 'child',
  'issue', 'cause', 'effect', 'challenge', 'solution', 'example', 'job',
  'resource', 'participant', 'respondent', 'worker', 'citizen',
])
const ONE_OF_MOST_RE = /\bone\s+of\s+the\s+most\s+[a-z]+\s+(factor|reason|problem|benefit|drawback|advantage|disadvantage|issue|challenge|example|country|company|student)\b/dgi

const EVERY_PLURAL_RE = /\b(each|every)\s+(students|children|people|teachers|workers|companies|countries|individuals|citizens|parents|employees|consumers|problems|solutions|benefits|drawbacks)\b/dgi
const EVERY_PLURAL_FIX = {
  students: 'student',
  children: 'child',
  people: 'person',
  teachers: 'teacher',
  workers: 'worker',
  companies: 'company',
  countries: 'country',
  individuals: 'individual',
  citizens: 'citizen',
  parents: 'parent',
  employees: 'employee',
  consumers: 'consumer',
  problems: 'problem',
  solutions: 'solution',
  benefits: 'benefit',
  drawbacks: 'drawback',
}

const MANY_SINGULAR_NOUNS = new Set([
  'problem', 'reason', 'factor', 'benefit', 'drawback', 'advantage',
  'disadvantage', 'student', 'company', 'country', 'solution', 'effect',
  'cause', 'issue', 'challenge', 'example', 'job', 'resource', 'idea',
  'argument', 'individual', 'citizen', 'opportunity', 'policy',
])
const MANY_SINGULAR_RE = /\b(many|several|numerous|various|few|both)\s+([a-z]+)\b/dgi

const UNCOUNTABLE_PLURALS = {
  informations: 'information',
  advices: 'advice',
  equipments: 'equipment',
  knowledges: 'knowledge',
  evidences: 'evidence',
  softwares: 'software',
  homeworks: 'homework',
  furnitures: 'furniture',
  luggages: 'luggage',
  baggages: 'baggage',
  feedbacks: 'feedback',
  pollutions: 'pollution',
  traffics: 'traffic',
  trainings: 'training',
}
const UNCOUNTABLE_PLURAL_RE = new RegExp(`\\b(${Object.keys(UNCOUNTABLE_PLURALS).join('|')})\\b`, 'dgi')

const UNCOUNTABLE_NOUNS = [
  'information', 'advice', 'research', 'evidence', 'knowledge', 'equipment',
  'furniture', 'homework', 'feedback', 'traffic', 'pollution', 'luggage',
  'baggage', 'news', 'training',
]
const UNCOUNTABLE_ARTICLE_RE = new RegExp(
  `\\b(a|an)\\s+(${UNCOUNTABLE_NOUNS.join('|')})\\b(?!\\s+(?:study|paper|project|programme|program|institute|center|centre|unit|team))`,
  'dgi',
)
const MANY_UNCOUNTABLE_RE = new RegExp(
  `\\b(many)\\s+(?:${UNCOUNTABLE_NOUNS.join('|')})\\b(?!\\s+(?:sources?|systems?|items?|points?|resources?|studies|papers))`,
  'dgi',
)
const MUCH_PLURAL_RE = new RegExp(`\\bmuch\\s+(${COUNTABLE_PLURALS.join('|')})\\b`, 'dgi')
const LESS_PLURAL_RE = new RegExp(`\\bless\\s+(${COUNTABLE_PLURALS.join('|')})\\b`, 'dgi')
const AMOUNT_COUNTABLE_RE = new RegExp(`\\b(amount|amounts)\\s+of\\s+(?:${COUNTABLE_PLURALS.join('|')})\\b`, 'dgi')

const MORE_COMPARATIVE_RE = /\bmore\s+(easier|better|worse|faster|cheaper|bigger|higher|lower|greater|smaller|stronger|weaker|harder|simpler|clearer|safer|healthier|longer|shorter|older|younger|earlier|later)\b/dgi
const MOST_SUPERLATIVE_RE = /\bmost\s+(easiest|best|worst|fastest|cheapest|biggest|highest|lowest|greatest|smallest|strongest|weakest|hardest|simplest|clearest|safest|healthiest|longest|shortest|oldest|youngest|earliest|latest)\b/dgi

const MOST_OF_RE = /\b(most|some|many|few|several|both|all)\s+of\s+(people|students|children|individuals|citizens|workers|companies|countries|governments|problems|solutions|benefits|drawbacks)\b/dgi

const OPINION_RE = /\bin\s+my\s+opinion\s*,?\s*i\s+(?:think|believe|feel)\s+(?:that\s+)?/dgi

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'if', 'of', 'to', 'in', 'on', 'at',
  'by', 'for', 'with', 'from', 'as', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'not', 'no', 'this',
  'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their', 'there',
  'here', 'which', 'who', 'whom', 'whose', 'what', 'when', 'where', 'why',
  'how', 'can', 'could', 'should', 'would', 'will', 'may', 'might', 'must',
  'also', 'than', 'then', 'so', 'such', 'very', 'more', 'most', 'much',
  'many', 'some', 'any', 'all', 'both', 'each', 'every', 'other', 'another',
  'own', 'same', 'only', 'just', 'about', 'into', 'over', 'under', 'between',
  'through', 'during', 'before', 'after', 'above', 'below', 'up', 'down',
  'out', 'off', 'again', 'further', 'once', 'our', 'we', 'you', 'your', 'i',
  'me', 'my', 'he', 'she', 'him', 'her', 'his', 'us', 'one', 'two', 'first',
  'second', 'third', 'while', 'because', 'however', 'therefore', 'thus',
  'therefore', 'whereas', 'although', 'though', 'even', 'still', 'yet',
])

function collectIssues (source) {
  const occupied = []
  const issues = []

  const overlaps = (start, end) => occupied.some(([a, b]) => start < b && end > a)

  function add (issue) {
    const { start, end } = issue
    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end <= start || end > source.length) return false
    if (overlaps(start, end)) return false
    const suggestions = [...new Set((issue.suggestions ?? []).filter((value) => typeof value === 'string'))]
    occupied.push([start, end])
    issues.push({
      ...issue,
      original: source.slice(start, end),
      suggestions,
      criterion: issue.criterion ?? 'GRA',
    })
    return true
  }

  function addGroup (match, group, meta) {
    const range = match.indices?.[group]
    if (range === undefined) return false
    return add({
      ...meta,
      start: range[0],
      end: range[1],
      original: source.slice(range[0], range[1]),
    })
  }

  function addWhole (match, meta) {
    return addGroup(match, 0, meta)
  }

  // 1. High-frequency misspellings.
  for (const match of source.matchAll(SPELLING_RE)) {
    const wrong = match[1]
    const right = SPELLINGS[wrong.toLowerCase()]
    if (right === undefined) continue
    addGroup(match, 1, {
      code: 'spelling',
      category: 'spelling',
      severity: 'error',
      suggestions: [matchCase(wrong, right)],
      message: msg(`拼写错误：“${wrong}”应为“${right}”。`, `Spelling: “${wrong}” should be “${right}”.`),
      explanation: msg('拼写属于 GRA 的准确度；雅思作文中反复拼错会拉低分数。', 'Spelling counts towards grammatical accuracy; repeated misspellings lower the GRA score.'),
    })
  }

  // 2. Accidental word repetition.
  for (const match of source.matchAll(/\b([A-Za-z]+)(\s+)\1\b/dgi)) {
    const word = match[1].toLowerCase()
    if (word === 'had' || word === 'that') continue
    addWhole(match, {
      code: 'doubled-word',
      category: 'mechanics',
      severity: 'warning',
      suggestions: [match[1]],
      message: msg(`重复用词：“${match[1]} ${match[1]}”只需保留一个。`, `Repeated word: keep only one “${match[1]}”.`),
      explanation: msg('删除重复词可以避免句子读起来卡顿。', 'Removing the duplicate keeps the sentence easy to read.'),
    })
  }

  // 3. Spaces before punctuation.
  for (const match of source.matchAll(/\s+([,.;:!?])(?=\s|$)/dg)) {
    addWhole(match, {
      code: 'space-before-punctuation',
      category: 'mechanics',
      severity: 'warning',
      suggestions: [match[1]],
      message: msg('英语标点前不留空格。', 'Do not put a space before English punctuation.'),
      explanation: msg('这是格式问题，但会影响 CC 中的行文整洁度。', 'A formatting issue that can still affect the clarity of your writing.'),
    })
  }

  // 4. Missing space after punctuation.
  for (const match of source.matchAll(/([A-Za-z])([,;:])([A-Za-z])/dg)) {
    addWhole(match, {
      code: 'space-after-punctuation',
      category: 'mechanics',
      severity: 'warning',
      suggestions: [`${match[1]}${match[2]} ${match[3]}`],
      message: msg(`标点后需要空格：“${match[0]}”。`, `Add a space after the punctuation: “${match[0]}”.`),
      explanation: msg('逗号、分号和冒号后空一格。', 'Use one space after a comma, semicolon or colon.'),
    })
  }
  for (const match of source.matchAll(/([a-z])\.([A-Z][a-z])/dg)) {
    addWhole(match, {
      code: 'space-after-period',
      category: 'mechanics',
      severity: 'warning',
      suggestions: [`${match[1]}. ${match[2]}`],
      message: msg('句号后需要空格，再开始下一句。', 'Use a space after a full stop before the next sentence.'),
      explanation: msg('英文句子之间用“句号 + 空格”分隔。', 'Separate English sentences with a full stop followed by a space.'),
    })
  }

  // 5. Lower-case pronoun I.
  for (const match of source.matchAll(/\bi\b(?!\.[a-z])/dg)) {
    addWhole(match, {
      code: 'lowercase-i',
      category: 'mechanics',
      severity: 'error',
      suggestions: ['I'],
      message: msg('英语中的第一人称代词 I 必须大写。', 'The first-person pronoun I is always capitalised.'),
      explanation: msg('这是书面英语最基本的规范之一。', 'This is one of the basic conventions of written English.'),
    })
  }

  // 6. Third-person singular subject with a plural verb.
  for (const match of source.matchAll(SINGULAR_SUBJECT_RE)) {
    const subject = match[1]
    const verb = match[2]
    const fix = SINGULAR_VERB_FIX[verb.toLowerCase()]
    if (fix === undefined) continue
    addGroup(match, 2, {
      code: 'subject-verb-singular',
      category: 'agreement',
      severity: 'error',
      suggestions: [matchCase(verb, fix)],
      message: msg(`主谓不一致：“${subject}”是单数，动词不能用“${verb}”。`, `Subject–verb agreement: “${subject}” is singular, so “${verb}” is wrong.`),
      explanation: msg(`第三人称单数主语要搭配 ${fix}。`, `A third-person singular subject takes ${fix}.`),
    })
  }

  // 7. Plural subject with a third-person singular verb.
  for (const match of source.matchAll(PLURAL_SUBJECT_RE)) {
    const subject = match[1]
    const verb = match[2]
    const fix = PLURAL_VERB_FIX[verb.toLowerCase()]
    if (fix === undefined) continue
    const verbStart = match.indices?.[2]?.[0] ?? match.index
    const prefix = source.slice(Math.max(0, verbStart - 70), verbStart).toLowerCase()
    // a/the number of people is … is handled by the dedicated rule below,
    // which gives the learner a more precise explanation.
    if (/\b(?:a|the)\s+number\s+of\s+[a-z]+\s*$/.test(prefix)) continue
    addGroup(match, 2, {
      code: 'subject-verb-plural',
      category: 'agreement',
      severity: 'error',
      suggestions: [matchCase(verb, fix)],
      message: msg(`主谓不一致：“${subject}”是复数，动词不能用“${verb}”。`, `Subject–verb agreement: “${subject}” is plural, so use “${fix}”, not “${verb}”.`),
      explanation: msg(`复数主语要求动词用复数形式 ${fix}。`, `A plural subject requires the plural verb form ${fix}.`),
    })
  }

  // 8. First-person singular "I" with a third-person singular verb.
  // "I needs" / "I has" / "I is" are high-frequency learner errors and are not
  // covered by the plural-subject rule because I is not a plural subject.
  for (const match of source.matchAll(FIRST_PERSON_SUBJECT_RE)) {
    const verb = match[1]
    const fix = FIRST_PERSON_VERB_FIX[verb.toLowerCase()]
    if (fix === undefined) continue
    addGroup(match, 1, {
      code: 'subject-verb-first-person',
      category: 'agreement',
      severity: 'error',
      suggestions: [matchCase(verb, fix)],
      message: msg(`主谓不一致：“I” 是第一人称单数，不能用第三人称单数形式“${verb}”。`, `Subject–verb agreement: “I” takes the base verb, not the third-person form “${verb}”.`),
      explanation: msg(`第一人称 I 后面用动词原形：I ${fix}。`, `After I, use the base verb: I ${fix}.`),
    })
  }

  // 9. Third-person singular pronoun with a base verb: she need -> she needs.
  for (const match of source.matchAll(THIRD_PERSON_BASE_RE)) {
    const subject = match[1]
    const verb = match[2]
    const fix = THIRD_PERSON_BASE_FIX[verb.toLowerCase()]
    if (fix === undefined) continue
    const subjectStart = match.indices?.[1]?.[0] ?? match.index
    const before = source.slice(Math.max(0, subjectStart - 48), subjectStart)
    // Questions such as "Does she need …?" are correct: skip an inverted
    // auxiliary immediately before the subject.
    if (AUXILIARY_BEFORE_SUBJECT_RE.test(before)) continue
    const verbEnd = match.indices?.[2]?.[1] ?? (match.index + match[0].length)
    const after = source.slice(verbEnd, verbEnd + 24)
    // "She need not worry" and "she need only …" use need as a modal.
    if (/^\s+(?:not|only|hardly)\b/i.test(after)) continue
    addGroup(match, 2, {
      code: 'subject-verb-third-person-base',
      category: 'agreement',
      severity: 'error',
      suggestions: [matchCase(verb, fix)],
      message: msg(`主谓不一致：“${subject}” 是第三人称单数，动词要用“${fix}”。`, `Subject–verb agreement: “${subject}” takes “${fix}”, not the base verb “${verb}”.`),
      explanation: msg(`第三人称单数主语后面要加 -s / -es：${subject} ${fix}。`, `A third-person singular subject takes the -s/-es form: ${subject} ${fix}.`),
    })
  }

  // 10. There is / was with a plural idea.
  for (const match of source.matchAll(THERE_QUANTIFIER_RE)) {
    const be = match[1]
    const fix = be.toLowerCase() === 'is' ? 'are' : 'were'
    addGroup(match, 1, {
      code: 'there-is-plural',
      category: 'agreement',
      severity: 'error',
      suggestions: [matchCase(be, fix)],
      message: msg(`“there ${be}”后面接复数概念，应改为“there ${fix}”。`, `“There ${be}” is followed by a plural idea; use “there ${fix}”.`),
      explanation: msg('there be 句型的 be 动词要与后面的真正主语一致。', 'In a there-be sentence, the verb agrees with the real subject that follows.'),
    })
  }
  for (const match of source.matchAll(THERE_NOUN_RE)) {
    const be = match[1]
    const fix = be.toLowerCase() === 'is' ? 'are' : 'were'
    addGroup(match, 1, {
      code: 'there-is-plural-noun',
      category: 'agreement',
      severity: 'error',
      suggestions: [matchCase(be, fix)],
      message: msg(`“there ${be}”后接复数名词，应使用“there ${fix}”。`, `A plural noun follows “there ${be}”; use “there ${fix}”.`),
      explanation: msg('there be 的 be 动词随后面的名词变化。', 'The there-be verb agrees with the noun that follows it.'),
    })
  }

  // 9. the number of … are / a number of … is.
  for (const match of source.matchAll(/\bthe\s+number\s+of\s+(?:people|students|children|workers|individuals|citizens|companies|countries|vehicles|cars|households|respondents|participants)\s+(are|were|have)\b/dgi)) {
    const verb = match[1]
    const fix = { are: 'is', were: 'was', have: 'has' }[verb.toLowerCase()]
    addGroup(match, 1, {
      code: 'the-number-of',
      category: 'agreement',
      severity: 'error',
      suggestions: [matchCase(verb, fix)],
      message: msg('“the number of + 复数名词”表示数量，谓语要用单数。', '“The number of + plural noun” is singular, so the verb must be singular.'),
      explanation: msg('真正的主语是 number，而不是后面的复数名词。', 'The head noun is number, not the plural noun after of.'),
    })
  }
  for (const match of source.matchAll(/\ba\s+number\s+of\s+(?:people|students|children|workers|individuals|citizens|companies|countries|vehicles|cars|households|respondents|participants)\s+(is|was|has)\b/dgi)) {
    const verb = match[1]
    const fix = { is: 'are', was: 'were', has: 'have' }[verb.toLowerCase()]
    addGroup(match, 1, {
      code: 'a-number-of',
      category: 'agreement',
      severity: 'error',
      suggestions: [matchCase(verb, fix)],
      message: msg('“a number of + 复数名词”表示“许多”，谓语要用复数。', '“A number of + plural noun” means many, so the verb is plural.'),
      explanation: msg('这里的 a number of 是数量短语，中心意义是复数。', 'Here a number of is a quantifier with a plural meaning.'),
    })
  }

  // 10. one of the … patterns.
  for (const match of source.matchAll(ONE_OF_PLURAL_RE)) {
    const noun = match[1]
    const verb = match[2]
    const fix = { are: 'is', were: 'was', have: 'has' }[verb.toLowerCase()]
    addGroup(match, 2, {
      code: 'one-of-plural-verb',
      category: 'agreement',
      severity: 'error',
      suggestions: [matchCase(verb, fix)],
      message: msg(`“one of the ${noun}”的中心词是 one，谓语要用单数。`, `The head of “one of the ${noun}” is one, so the verb is singular.`),
      explanation: msg('one of the + 复数名词之后，谓语与 one 一致。', 'After one of the + plural noun, the verb agrees with one.'),
    })
  }
  for (const match of source.matchAll(ONE_OF_SINGULAR_RE)) {
    const noun = match[1].toLowerCase()
    if (!ONE_OF_SINGULAR_NOUNS.has(noun)) continue
    addGroup(match, 1, {
      code: 'one-of-singular-noun',
      category: 'agreement',
      severity: 'error',
      suggestions: [matchCase(match[1], pluralize(match[1]))],
      message: msg(`“one of the”后面要接复数名词：“${match[1]}”应改为“${pluralize(match[1])}”。`, `“One of the” needs a plural noun: use “${pluralize(match[1])}”, not “${match[1]}”.`),
      explanation: msg('one of the + 复数名词，表示“其中之一”。', 'The pattern is one of the + plural noun, meaning one among several.'),
    })
  }
  for (const match of source.matchAll(ONE_OF_MOST_RE)) {
    const noun = match[1]
    addGroup(match, 1, {
      code: 'one-of-most',
      category: 'agreement',
      severity: 'error',
      suggestions: [matchCase(noun, pluralize(noun))],
      message: msg(`“one of the most …”后面同样要用复数名词：“${noun}”应改为“${pluralize(noun)}”。`, `“One of the most …” also takes a plural noun: “${pluralize(noun)}”, not “${noun}”.`),
      explanation: msg('one of 后面的名词必须为复数。', 'The noun after one of must be plural.'),
    })
  }

  // 11. each / every + plural noun.
  for (const match of source.matchAll(EVERY_PLURAL_RE)) {
    const determiner = match[1]
    const noun = match[2]
    const fix = EVERY_PLURAL_FIX[noun.toLowerCase()]
    if (fix === undefined) continue
    addGroup(match, 2, {
      code: 'every-plural',
      category: 'agreement',
      severity: 'error',
      suggestions: [matchCase(noun, fix)],
      message: msg(`“${determiner}”后面接单数名词：“${noun}”应改为“${fix}”。`, `“${determiner}” takes a singular noun: use “${fix}”, not “${noun}”.`),
      explanation: msg('each / every 强调逐个个体，后面用单数可数名词。', 'Each and every refer to individuals one by one and take a singular countable noun.'),
    })
  }

  // 12. many / several + singular countable noun.
  for (const match of source.matchAll(MANY_SINGULAR_RE)) {
    const quantifier = match[1]
    const noun = match[2]
    if (!MANY_SINGULAR_NOUNS.has(noun.toLowerCase())) continue
    addGroup(match, 2, {
      code: 'quantifier-singular-noun',
      category: 'agreement',
      severity: 'error',
      suggestions: [matchCase(noun, pluralize(noun))],
      message: msg(`“${quantifier}”后接可数名词复数：“${noun}”应改为“${pluralize(noun)}”。`, `“${quantifier}” takes a plural countable noun: use “${pluralize(noun)}”, not “${noun}”.`),
      explanation: msg('many / several / numerous 等数量词修饰可数名词时，名词要用复数。', 'Quantifiers such as many, several and numerous require a plural countable noun.'),
    })
  }

  // 13. Articles before vowel sounds and silent h.
  for (const match of source.matchAll(AN_NOUN_RE)) {
    addGroup(match, 1, {
      code: 'a-before-vowel',
      category: 'article',
      severity: 'error',
      suggestions: ['an'],
      message: msg(`“${match[2]}”以元音音素开头，应用 an。`, `“${match[2]}” begins with a vowel sound, so use an.`),
      explanation: msg('冠词看的是读音，不是拼写：an important issue。', 'The article follows the sound, not just the letter: an important issue.'),
    })
  }
  for (const match of source.matchAll(SILENT_H_RE)) {
    addGroup(match, 1, {
      code: 'a-before-silent-h',
      category: 'article',
      severity: 'error',
      suggestions: ['an'],
      message: msg(`“${match[2]}”的 h 不发音，应以元音音素开头，用 an。`, `The h in “${match[2]}” is silent, so use an.`),
      explanation: msg('an hour / an honest person：看发音，不看首字母。', 'An hour and an honest person: the article follows the sound.'),
    })
  }
  for (const match of source.matchAll(AN_EXCEPTION_RE)) {
    addGroup(match, 1, {
      code: 'an-before-consonant-sound',
      category: 'article',
      severity: 'error',
      suggestions: ['a'],
      message: msg(`“${match[2]}”以辅音音素开头，应用 a。`, `“${match[2]}” begins with a consonant sound, so use a.`),
      explanation: msg('a university / a European country：拼写是元音字母，读音却是辅音开头。', 'A university and a European country: the spelling starts with a vowel letter but the sound is consonantal.'),
    })
  }
  for (const match of source.matchAll(AN_CONSONANT_RE)) {
    addGroup(match, 1, {
      code: 'an-before-consonant',
      category: 'article',
      severity: 'error',
      suggestions: ['a'],
      message: msg(`“${match[2]}”以辅音音素开头，应用 a，而不是 an。`, `“${match[2]}” begins with a consonant sound, so use a, not an.`),
      explanation: msg('常见错误：an car → a car。', 'A common slip: an car → a car.'),
    })
  }

  // 14. Missing article before a singular profession.
  for (const match of source.matchAll(PROFESSION_RE)) {
    const noun = match[2]
    const article = articleFor(noun)
    addGroup(match, 2, {
      code: 'missing-profession-article',
      category: 'article',
      severity: 'error',
      suggestions: [`${article} ${matchCase(noun, noun)}`],
      message: msg(`可数名词“${noun}”表示职业时，单数前需要冠词：“${article} ${noun}”。`, `A singular profession noun needs an article: “${article} ${noun}”.`),
      explanation: msg('He is a teacher / She wants to be an engineer。', 'He is a teacher. She wants to be an engineer.'),
    })
  }

  // 15. High-frequency preposition and verb-pattern fixes.
  const wholeFixes = [
    {
      re: /\bdiscuss(?:es|ed|ing)?\s+about\b/dgi,
      replace: (value) => value.replace(/\s+about\b/i, ''),
      zh: 'discuss 是及物动词，后面直接接宾语，不加 about。',
      en: 'Discuss is transitive: use discuss the issue, not discuss about the issue.',
      code: 'discuss-about',
    },
    {
      re: /\bemphasi[sz](?:es|ed|ing)?\s+on\b/dgi,
      replace: (value) => value.replace(/\s+on\b/i, ''),
      zh: 'emphasise 是及物动词，直接接宾语。',
      en: 'Emphasise is transitive and takes a direct object.',
      code: 'emphasise-on',
    },
    {
      re: /\bexplain(?:s|ed|ing)?\s+about\b/dgi,
      replace: (value) => value.replace(/\s+about\b/i, ''),
      zh: 'explain 后面直接接宾语，不用 about。',
      en: 'Explain takes a direct object; do not add about.',
      code: 'explain-about',
    },
    {
      re: /\bmention(?:s|ed|ing)?\s+about\b/dgi,
      replace: (value) => value.replace(/\s+about\b/i, ''),
      zh: 'mention 是及物动词，直接接宾语。',
      en: 'Mention is transitive and takes a direct object.',
      code: 'mention-about',
    },
    {
      re: /\binvestigat(?:e|es|ed|ing)\s+about\b/dgi,
      replace: (value) => value.replace(/\s+about\b/i, ''),
      zh: 'investigate 后面直接接调查对象。',
      en: 'Investigate takes its object directly.',
      code: 'investigate-about',
    },
    {
      re: /\bdepend(?:s|ed|ing)?\s+of\b/dgi,
      replace: (value) => value.replace(/\bof\b/i, 'on'),
      zh: '固定搭配是 depend on，不是 depend of。',
      en: 'The collocation is depend on, not depend of.',
      code: 'depend-of',
    },
    {
      re: /\bcapable\s+to\s+([a-z]+)\b/dgi,
      replace: (value, match) => `capable of ${toGerund(match[1])}`,
      zh: '固定搭配是 be capable of doing，动词要用 -ing 形式。',
      en: 'The pattern is be capable of doing; the verb takes -ing.',
      code: 'capable-to',
    },
    {
      re: /\binterested\s+on\b/dgi,
      replace: () => 'interested in',
      zh: '固定搭配是 be interested in。',
      en: 'The collocation is be interested in.',
      code: 'interested-on',
    },
    {
      re: /\bmarried\s+with\b/dgi,
      replace: () => 'married to',
      zh: '表示“与某人结婚”用 be married to。',
      en: 'Use be married to for a spouse.',
      code: 'married-with',
    },
    {
      re: /\bin\s+the\s+other\s+hand\b/dgi,
      replace: () => 'on the other hand',
      zh: '固定短语是 on the other hand。',
      en: 'The fixed phrase is on the other hand.',
      code: 'in-the-other-hand',
    },
    {
      re: /\bon\s+contrary\b/dgi,
      replace: () => 'on the contrary',
      zh: '固定短语是 on the contrary。',
      en: 'The fixed phrase is on the contrary.',
      code: 'on-contrary',
    },
    {
      re: /\bin\s+the\s+one\s+hand\b/dgi,
      replace: () => 'on the one hand',
      zh: '固定短语是 on the one hand。',
      en: 'The fixed phrase is on the one hand.',
      code: 'in-the-one-hand',
    },
    {
      re: /\bin\s+nowadays\b/dgi,
      replace: () => 'nowadays',
      zh: 'nowadays 本身就是副词，前面不加 in。',
      en: 'Nowadays is already an adverb; do not put in before it.',
      code: 'in-nowadays',
    },
    {
      re: /\bin\s+the\s+recent\s+years\b/dgi,
      replace: () => 'in recent years',
      zh: '固定表达是 in recent years，不需要 the。',
      en: 'The standard phrase is in recent years without the.',
      code: 'in-the-recent-years',
    },
    {
      re: /\bin\s+the\s+past\s+decades\b/dgi,
      replace: () => 'in recent decades',
      zh: 'in recent decades 更自然。',
      en: 'In recent decades reads more naturally.',
      code: 'in-the-past-decades',
    },
    {
      re: /\bdespite\s+of\b/dgi,
      replace: () => 'despite',
      zh: 'despite 后面直接接名词，不加 of。',
      en: 'Despite is followed directly by a noun; do not add of.',
      code: 'despite-of',
    },
    {
      re: /\bbecause\s+of\s+the\s+fact\s+that\b/dgi,
      replace: () => 'because',
      zh: 'because of the fact that 冗长，直接用 because。',
      en: 'Because of the fact that is wordy; use because.',
      code: 'because-of-the-fact',
    },
    {
      re: /\bthe\s+reason\s+is\s+because\b/dgi,
      replace: () => 'the reason is that',
      zh: 'the reason is that 才是规范搭配。',
      en: 'The standard pattern is the reason is that.',
      code: 'reason-is-because',
    },
    {
      re: /\bsuch\s+like\b/dgi,
      replace: () => 'such as',
      zh: '表示举例用 such as，不用 such like。',
      en: 'Use such as to introduce examples.',
      code: 'such-like',
    },
    {
      re: /\b(?:am|is|are|was|were)\s+agree\b/dgi,
      replace: () => 'agree',
      zh: 'agree 本身是动词，不需要前面再加 be。',
      en: 'Agree is a verb and does not take be before it.',
      code: 'be-agree',
    },
    {
      re: /\b(can(?:not|'t)?|could(?:not|n't)?)\s+(?:be\s+)?able\s+to\b/dgi,
      replace: (value, match) => matchCase(value, match[1]),
      zh: '情态动词与 be able to 不能叠用：can able to → can。',
      en: 'Do not stack a modal with be able to: can able to → can.',
      code: 'can-able-to',
    },
    {
      re: /\b(explain|describe|mention|suggest)\s+(me|us|him|her|them)\b/dgi,
      replace: (value) => value.replace(/\s+(me|us|him|her|them)\b/i, ' to $1'),
      zh: '这些动词后接人时通常需要介词 to。',
      en: 'These verbs normally take to before the person.',
      code: 'verb-to-person',
    },
    {
      re: /\bdifferent\s+than\b/dgi,
      replace: () => 'different from',
      zh: '雅思书面语中更常用 different from。',
      en: 'Different from is the safer choice in IELTS writing.',
      code: 'different-than',
      severity: 'warning',
    },
  ]

  for (const fix of wholeFixes) {
    for (const match of source.matchAll(fix.re)) {
      const built = fix.replace(match[0], match)
      if (typeof built !== 'string' || built.length === 0) continue
      addWhole(match, {
        code: fix.code,
        category: 'preposition',
        severity: fix.severity ?? 'error',
        suggestions: [matchCase(match[0], built)],
        message: msg(fix.zh, fix.en),
        explanation: msg('固定搭配和介词搭配是 GRA 的常见扣分点。', 'Fixed prepositions and verb patterns are a common GRA issue.'),
      })
    }
  }

  // 16. Uncountable nouns: plural forms, articles and quantifiers.
  for (const match of source.matchAll(UNCOUNTABLE_PLURAL_RE)) {
    const wrong = match[1]
    const right = UNCOUNTABLE_PLURALS[wrong.toLowerCase()]
    addGroup(match, 1, {
      code: 'uncountable-plural',
      category: 'uncountable',
      severity: 'error',
      suggestions: [matchCase(wrong, right)],
      message: msg(`“${wrong}”是不可数名词，通常不用复数：“${right}”。`, `“${wrong}” is uncountable and normally has no plural: use “${right}”.`),
      explanation: msg('information / advice / equipment 等不可数名词没有常规复数。', 'Nouns such as information, advice and equipment are uncountable and have no ordinary plural.'),
    })
  }
  for (const match of source.matchAll(/\bpeoples\b/dgi)) {
    addWhole(match, {
      code: 'peoples',
      category: 'uncountable',
      severity: 'warning',
      suggestions: [matchCase(match[0], 'people')],
      message: msg('表示“人们”时 people 本身就是复数，不用 peoples。', 'People is already plural when it means persons; do not write peoples.'),
      explanation: msg('只有表示“多个民族”时才用 peoples，雅思作文中很少需要。', 'Peoples is reserved for ethnic groups and is rarely needed in IELTS Task 2.'),
    })
  }
  for (const match of source.matchAll(UNCOUNTABLE_ARTICLE_RE)) {
    const article = match[1]
    const noun = match[2]
    addWhole(match, {
      code: 'uncountable-article',
      category: 'uncountable',
      severity: 'error',
      suggestions: [
        matchCase(match[0], noun),
        matchCase(match[0], `some ${noun}`),
      ],
      message: msg(`“${article} ${noun}”搭配不当：${noun} 通常不可数。`, `“${article} ${noun}” is incorrect because ${noun} is normally uncountable.`),
      explanation: msg(`可以去掉冠词，或用 some ${noun} / a piece of ${noun}。`, `Drop the article, or use some ${noun} / a piece of ${noun}.`),
    })
  }
  for (const match of source.matchAll(MANY_UNCOUNTABLE_RE)) {
    addGroup(match, 1, {
      code: 'many-uncountable',
      category: 'uncountable',
      severity: 'error',
      suggestions: ['much'],
      message: msg('这句话里的名词不可数，不能用 many 修饰。', 'The following noun is uncountable and cannot follow many.'),
      explanation: msg('many 修饰可数复数；不可数名词用 much 或 a great deal of。', 'Many modifies plural countables; use much or a great deal of with uncountables.'),
    })
  }

  // 17. Quantifier agreement: much / less / amount.
  for (const match of source.matchAll(MUCH_PLURAL_RE)) {
    addGroup(match, 0, {
      code: 'much-plural',
      category: 'uncountable',
      severity: 'error',
      suggestions: [matchCase(match[0], `many ${match[1]}`)],
      message: msg(`“${match[1]}”是可数复数，不能用 much 修饰。`, `“${match[1]}” is a plural countable noun, so use many, not much.`),
      explanation: msg('much 接不可数名词，many 接可数复数名词。', 'Much goes with uncountable nouns; many goes with plural countables.'),
    })
  }
  for (const match of source.matchAll(LESS_PLURAL_RE)) {
    addGroup(match, 0, {
      code: 'less-plural',
      category: 'uncountable',
      severity: 'error',
      suggestions: [matchCase(match[0], `fewer ${match[1]}`)],
      message: msg(`修饰可数复数应用 fewer，而不是 less。`, `Use fewer, not less, before a plural countable noun.`),
      explanation: msg('fewer + 可数复数；less + 不可数名词。', 'Fewer + plural countable; less + uncountable.'),
    })
  }
  for (const match of source.matchAll(AMOUNT_COUNTABLE_RE)) {
    const amount = match[1]
    addGroup(match, 1, {
      code: 'amount-of-countable',
      category: 'uncountable',
      severity: 'error',
      suggestions: [amount.toLowerCase() === 'amounts' ? 'numbers' : 'number'],
      message: msg(`“${amount} of”后接可数复数时应用 number，而不是 amount。`, `Use number, not amount, before a plural countable noun.`),
      explanation: msg('the number of people / the amount of money。', 'The number of people, but the amount of money.'),
    })
  }

  // 18. Double comparatives and double superlatives.
  for (const match of source.matchAll(MORE_COMPARATIVE_RE)) {
    addWhole(match, {
      code: 'double-comparative',
      category: 'word-form',
      severity: 'error',
      suggestions: [matchCase(match[0], match[1])],
      message: msg(`双重比较级：“more ${match[1]}”应直接说“${match[1]}”。`, `Double comparative: use “${match[1]}”, not “more ${match[1]}”.`),
      explanation: msg('-er 形式或 more 只能二选一。', 'Use either the -er form or more, never both.'),
    })
  }
  for (const match of source.matchAll(MOST_SUPERLATIVE_RE)) {
    addWhole(match, {
      code: 'double-superlative',
      category: 'word-form',
      severity: 'error',
      suggestions: [matchCase(match[0], match[1])],
      message: msg(`双重最高级：“most ${match[1]}”应直接说“${match[1]}”。`, `Double superlative: use “${match[1]}”, not “most ${match[1]}”.`),
      explanation: msg('-est 形式或 most 只能二选一。', 'Use either the -est form or most, never both.'),
    })
  }

  // 19. Quantifier + of + bare plural.
  for (const match of source.matchAll(MOST_OF_RE)) {
    addWhole(match, {
      code: 'most-of-people',
      category: 'agreement',
      severity: 'error',
      suggestions: [matchCase(match[0], `${match[1]} ${match[2]}`)],
      message: msg(`“${match[1]} of ${match[2]}”应去掉 of，直接说“${match[1]} ${match[2]}”。`, `Drop of: say “${match[1]} ${match[2]}”.`),
      explanation: msg('most people 泛指；most of the people 才需要 the。', 'Most people is general; most of the people needs the.'),
    })
  }

  // 20. Redundant opinion frame.
  for (const match of source.matchAll(OPINION_RE)) {
    addWhole(match, {
      code: 'opinion-redundant',
      category: 'redundancy',
      severity: 'warning',
      suggestions: [matchCase(match[0], 'in my opinion, ')],
      message: msg('“In my opinion, I think…”语义重复，保留一个即可。', '“In my opinion, I think…” is redundant; keep only one frame.'),
      explanation: msg('更简洁：In my opinion, technology… 或 I would argue that…。', 'More concise: In my opinion, technology… or I would argue that….'),
    })
  }

  // 21. although … but.
  for (const match of source.matchAll(/\balthough\b([^.!?]{0,120}?)\b(but)\s+/dgi)) {
    const range = match.indices?.[2]
    if (range === undefined) continue
    const trailing = /\s/.test(source[range[1]] ?? '') ? 1 : 0
    add({
      code: 'although-but',
      category: 'conjunction',
      severity: 'warning',
      start: range[0],
      end: range[1] + trailing,
      original: source.slice(range[0], range[1] + trailing),
      suggestions: [''],
      message: msg('although 和 but 不能同时连接同一个让步从句，保留 although 即可。', 'Although and but cannot both introduce the same concession; keep although and drop but.'),
      explanation: msg('去掉 but 后，主句仍然完整。', 'With but removed, the main clause is still complete.'),
    })
  }

  // 22. General dictionary spelling, using both British and American dictionaries.
  // Lower-case words are checked everywhere. A capitalised word is checked only
  // at the start of a sentence and only when a high-frequency correction exists,
  // which keeps names and acronyms out of the report.
  for (const match of source.matchAll(/[A-Za-z]+(?:['’\-][A-Za-z]+)*/g)) {
    const word = match[0]
    if (word.length < 3) continue
    if (/['’\-]/.test(word)) continue
    if (!/^[A-Za-z]+$/.test(word)) continue
    const lower = word.toLowerCase()
    if (isKnownSpelling(lower)) continue
    let suggestions = spellingSuggestions(lower)
    if (suggestions.length === 0) continue

    const capitalised = /[A-Z]/.test(word)
    if (capitalised) {
      if (!/^[A-Z][a-z]+$/.test(word)) continue
      if (!isSentenceStart(source, match.index)) continue
      suggestions = suggestions
        .filter((suggestion) => PREFERRED_SUGGESTIONS.has(suggestion))
        .map((suggestion) => matchCase(word, suggestion))
      if (suggestions.length === 0) continue
    }

    add({
      code: 'spelling-dictionary',
      category: 'spelling',
      severity: 'error',
      start: match.index,
      end: match.index + word.length,
      suggestions,
      message: msg(`拼写可能错误：“${word}”。`, `Possible spelling error: “${word}”.`),
      explanation: msg('词典未收录该词；若它是专有名词或专业术语，可以忽略这条建议。', 'The word is not in the dictionary. Ignore this if it is a proper noun or a technical term.'),
    })
  }

  issues.sort((a, b) => a.start - b.start || a.end - b.end)
  return { issues, occupied }
}

function detectUpgrades (source, occupied) {
  const taken = occupied.slice()
  const upgrades = []
  const perTerm = new Map()
  const overlaps = (start, end) => taken.some(([a, b]) => start < b && end > a)

  const entries = [...UPGRADE_ENTRIES].sort((a, b) => b.term.length - a.term.length)

  for (const entry of entries) {
    const words = entry.term.trim().split(/\s+/).map(escapeRegExp).join('\\s+')
    const pattern = new RegExp(`\\b${words}\\b`, 'dgi')
    let count = perTerm.get(entry.term) ?? 0

    for (const match of source.matchAll(pattern)) {
      if (count >= MAX_UPGRADES_PER_TERM || upgrades.length >= MAX_UPGRADE_CARDS) break
      const start = match.index
      const end = start + match[0].length
      if (overlaps(start, end)) continue

      const original = source.slice(start, end)
      const alternatives = entry.alternatives
        .filter((alternative) => alternative.text.toLowerCase() !== original.toLowerCase())
        .map((alternative) => ({
          text: matchCase(original, alternative.text),
          band: alternative.band,
          note: alternative.note ?? NOTE_DEFAULT,
        }))
      if (alternatives.length === 0) continue

      upgrades.push({
        id: `upgrade:${start}:${entry.term}`,
        term: entry.term,
        kind: entry.kind,
        start,
        end,
        original,
        alternatives,
        reason: entry.reason ?? REASON_DEFAULTS[entry.kind] ?? NOTE_DEFAULT,
        criterion: 'LR',
      })
      taken.push([start, end])
      count += 1
      perTerm.set(entry.term, count)
    }
  }

  upgrades.sort((a, b) => a.start - b.start)
  return upgrades
}

function countWords (source) {
  return (source.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g) ?? []).length
}

function sentenceStats (source) {
  const sentences = (source.match(/[^.!?]+[.!?]*/g) ?? [])
    .map((sentence) => sentence.trim())
    .filter((sentence) => countWords(sentence) > 0)

  const lengths = sentences.map((sentence) => countWords(sentence))
  const total = lengths.reduce((sum, value) => sum + value, 0)
  return {
    count: sentences.length,
    long: lengths.filter((value) => value > 35).length,
    average: lengths.length === 0 ? 0 : Math.round((total / lengths.length) * 10) / 10,
  }
}

function repeatedWords (contentWords) {
  const counts = new Map()
  for (const word of contentWords) {
    counts.set(word, (counts.get(word) ?? 0) + 1)
  }
  return [...counts.entries()]
    .filter(([word, count]) => count >= 3 && word.length >= 4)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, MAX_REPEATED_WORDS)
    .map(([term, count]) => ({
      term,
      count,
      alternatives: (UPGRADE_INDEX.get(term)?.alternatives ?? []).slice(0, 2),
    }))
}

/**
 * Analyse a draft.
 *
 * @param {string} text - essay draft, preserving the user's original characters.
 * @returns {{
 *   version: number,
 *   stats: Record<string, number | null>,
 *   grammar: Array<Record<string, unknown>>,
 *   upgrades: Array<Record<string, unknown>>,
 *   repeated: Array<{ term: string, count: number, alternatives: string[] }>
 * }}
 */
export function analyze (text) {
  if (typeof text !== 'string') throw new TypeError('text must be a string')
  if (text.length > MAX_TEXT_LENGTH) {
    const error = new Error('TEXT_TOO_LONG')
    error.code = 'TEXT_TOO_LONG'
    throw error
  }

  const { issues, occupied } = collectIssues(text)
  const upgrades = detectUpgrades(text, occupied)
  const words = countWords(text)
  const sentence = sentenceStats(text)
  const paragraphs = text.split(/\n\s*\n/).map((value) => value.trim()).filter((value) => countWords(value) > 0).length
  const contentWords = (text.toLowerCase().match(/[a-z]+(?:['’-][a-z]+)*/g) ?? [])
    .filter((word) => word.length >= 4 && !STOPWORDS.has(word))
  const uniqueContent = new Set(contentWords).size
  const counts = { error: 0, warning: 0, style: 0 }
  for (const issue of issues) counts[issue.severity] += 1

  const weighted = counts.error + counts.warning * 0.6 + counts.style * 0.25
  const grammarScore = words < 25
    ? null
    : Math.max(15, Math.min(100, Math.round(100 - (weighted / words) * 100 * 7.5)))

  return {
    version: 1,
    stats: {
      characters: text.length,
      words,
      sentences: sentence.count,
      paragraphs: paragraphs || (words > 0 ? 1 : 0),
      averageSentenceLength: sentence.average,
      longSentences: sentence.long,
      contentWords: contentWords.length,
      uniqueContentWords: uniqueContent,
      lexicalVariety: contentWords.length === 0 ? 0 : Math.round((uniqueContent / contentWords.length) * 100),
      errors: counts.error,
      warnings: counts.warning,
      styleIssues: counts.style,
      issueCount: issues.length,
      upgradeCount: upgrades.length,
      grammarScore,
      maxTextLength: MAX_TEXT_LENGTH,
    },
    grammar: issues,
    upgrades,
    repeated: repeatedWords(contentWords),
  }
}

export const analyse = analyze
