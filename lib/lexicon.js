/**
 * Curated lexical upgrades for IELTS Writing Task 2.
 *
 * Each entry is deliberately conservative: alternatives keep the same part of
 * speech and can replace the matched phrase in place. Notes tell the writer
 * when an alternative is only appropriate for countable or uncountable nouns.
 *
 * @module dsh-ielts-grammar/lexicon
 */

const note = (zh, en) => ({ zh, en })

const WORD_REASON = note(
  '这是 Task 2 中偏基础的高频词；换成更精确的学术表达可提升词汇多样性和正式度。',
  'A high-frequency basic word. A more precise academic choice improves lexical variety and register.',
)

const PHRASE_REASON = note(
  '这是一条常见的雅思表达；换成更凝练的学术搭配，可以让论证更像书面语。',
  'A common IELTS phrase. A more concise academic collocation makes the argument read as formal writing.',
)

const DEFAULT_NOTE = note('更正式、更具体，适合 Task 2 书面表达。', 'More formal and precise for Task 2 academic writing.')

/**
 * @typedef {{ text: string, band: 7 | 8 | 9, note?: { zh: string, en: string } }} UpgradeAlternative
 * @typedef {{ term: string, kind: 'word' | 'phrase' | 'collocation', alternatives: UpgradeAlternative[], reason?: { zh: string, en: string } }} UpgradeEntry
 */

/** @type {UpgradeEntry[]} */
export const UPGRADE_ENTRIES = [
  {
    term: 'important',
    kind: 'word',
    alternatives: [
      { text: 'crucial', band: 8, note: note('强调“不可或缺”，常用于论证必要性。', 'Signals necessity; strong in argumentative sentences.') },
      { text: 'pivotal', band: 9, note: note('强调关键转折或决定作用。', 'Highlights a decisive or turning-point role.') },
      { text: 'significant', band: 7 },
    ],
  },
  {
    term: 'good',
    kind: 'word',
    alternatives: [
      { text: 'beneficial', band: 8, note: note('适合描述政策、习惯或技术的积极作用。', 'Works well for the positive effects of a policy, habit or technology.') },
      { text: 'advantageous', band: 8 },
      { text: 'effective', band: 7 },
    ],
  },
  {
    term: 'bad',
    kind: 'word',
    alternatives: [
      { text: 'detrimental', band: 8, note: note('常与 to / effect on 搭配，语气比 bad 强。', 'Often used with to or an effect on; stronger than bad.') },
      { text: 'adverse', band: 8 },
      { text: 'harmful', band: 7 },
    ],
  },
  {
    term: 'big',
    kind: 'word',
    alternatives: [
      { text: 'substantial', band: 8, note: note('描述规模、数量或影响，不用于人。', 'For scale, amount or impact, not people.') },
      { text: 'considerable', band: 8 },
      { text: 'significant', band: 7 },
    ],
  },
  {
    term: 'small',
    kind: 'word',
    alternatives: [
      { text: 'minor', band: 7, note: note('强调重要性低，而非体积小。', 'Emphasises low importance rather than physical size.') },
      { text: 'marginal', band: 8 },
      { text: 'negligible', band: 9, note: note('强调小到可以忽略。', 'Small enough to be ignored.') },
    ],
  },
  {
    term: 'many',
    kind: 'word',
    alternatives: [
      { text: 'numerous', band: 8 },
      { text: 'a multitude of', band: 9, note: note('语气强，适合正式论证，不宜反复使用。', 'Emphatic; keep it for one or two places only.') },
    ],
  },
  {
    term: 'people',
    kind: 'word',
    alternatives: [
      { text: 'individuals', band: 8, note: note('强调一个个个体，适合讨论个人选择。', 'Emphasises individual people and personal choices.') },
      { text: 'citizens', band: 8, note: note('适合讨论公民、公共政策。', 'Best for citizens and public policy.') },
      { text: 'members of society', band: 8 },
    ],
  },
  {
    term: 'children',
    kind: 'word',
    alternatives: [
      { text: 'youngsters', band: 8 },
      { text: 'minors', band: 8, note: note('偏法律、年龄限制语境。', 'Legal or age-restriction contexts.') },
      { text: 'the younger generation', band: 8 },
    ],
  },
  {
    term: 'government',
    kind: 'word',
    alternatives: [
      { text: 'the authorities', band: 8 },
      { text: 'policymakers', band: 8, note: note('强调政策制定者，不一定是政府整体。', 'Focuses on people who shape policy, not the whole state.') },
      { text: 'the state', band: 8 },
    ],
  },
  {
    term: 'technology',
    kind: 'word',
    alternatives: [
      { text: 'technological innovation', band: 9 },
      { text: 'digital tools', band: 8, note: note('仅用于具体数字工具，不泛指科技。', 'Only for concrete digital tools, not technology in general.') },
    ],
  },
  {
    term: 'environment',
    kind: 'word',
    alternatives: [
      { text: 'the ecosystem', band: 8, note: note('强调生态整体，不用于“学习环境”等抽象语境。', 'For the ecological system, not abstract contexts such as a learning environment.') },
      { text: 'the natural environment', band: 7 },
    ],
  },
  {
    term: 'problem',
    kind: 'word',
    alternatives: [
      { text: 'challenge', band: 8 },
      { text: 'drawback', band: 8, note: note('强调缺点或不利之处。', 'Highlights a disadvantage.') },
      { text: 'issue', band: 7 },
    ],
  },
  {
    term: 'problems',
    kind: 'word',
    alternatives: [
      { text: 'challenges', band: 8 },
      { text: 'drawbacks', band: 8 },
      { text: 'shortcomings', band: 8 },
    ],
  },
  {
    term: 'advantages',
    kind: 'word',
    alternatives: [
      { text: 'merits', band: 8 },
      { text: 'benefits', band: 7 },
      { text: 'strengths', band: 8 },
    ],
  },
  {
    term: 'disadvantages',
    kind: 'word',
    alternatives: [
      { text: 'drawbacks', band: 8 },
      { text: 'shortcomings', band: 8 },
      { text: 'pitfalls', band: 9, note: note('强调隐藏的风险或陷阱。', 'Hidden risks or traps.') },
    ],
  },
  {
    term: 'think',
    kind: 'word',
    alternatives: [
      { text: 'argue', band: 8, note: note('适合表达有论据支撑的立场。', 'For a position supported by reasons.') },
      { text: 'maintain', band: 8 },
      { text: 'contend', band: 9 },
    ],
  },
  {
    term: 'show',
    kind: 'word',
    alternatives: [
      { text: 'demonstrate', band: 8 },
      { text: 'illustrate', band: 8, note: note('强调用例子说明。', 'Often introduces an example.') },
      { text: 'reveal', band: 8 },
    ],
  },
  {
    term: 'help',
    kind: 'word',
    alternatives: [
      { text: 'facilitate', band: 8, note: note('表示让过程更容易，不用于直接身体帮助。', 'Makes a process easier; not for direct physical help.') },
      { text: 'foster', band: 8, note: note('常搭配 development, growth, innovation。', 'Collocates with development, growth and innovation.') },
      { text: 'assist', band: 7 },
    ],
  },
  {
    term: 'use',
    kind: 'word',
    alternatives: [
      { text: 'utilise', band: 8, note: note('英式拼写；需有明确工具或资源作宾语。', 'British spelling; needs a clear tool or resource as its object.') },
      { text: 'employ', band: 8 },
      { text: 'harness', band: 9, note: note('强调把某种力量或技术为我所用。', 'Harnessing a force or technology for a purpose.') },
    ],
  },
  {
    term: 'get',
    kind: 'word',
    alternatives: [
      { text: 'obtain', band: 8, note: note('获取具体事物，如数据、资格。', 'Obtain concrete things such as data or qualifications.') },
      { text: 'acquire', band: 8 },
      { text: 'secure', band: 8 },
    ],
  },
  {
    term: 'enough',
    kind: 'word',
    alternatives: [
      { text: 'sufficient', band: 8 },
      { text: 'adequate', band: 8, note: note('强调“够用但不一定充裕”。', 'Enough for a purpose, not necessarily abundant.') },
    ],
  },
  {
    term: 'difficult',
    kind: 'word',
    alternatives: [
      { text: 'challenging', band: 8 },
      { text: 'demanding', band: 8 },
      { text: 'arduous', band: 9, note: note('强调过程艰苦而漫长。', 'A long and physically or mentally tiring process.') },
    ],
  },
  {
    term: 'useful',
    kind: 'word',
    alternatives: [
      { text: 'invaluable', band: 9, note: note('语气强，表示价值高到无法估量。', 'Extremely valuable.') },
      { text: 'beneficial', band: 8 },
      { text: 'practical', band: 7 },
    ],
  },
  {
    term: 'common',
    kind: 'word',
    alternatives: [
      { text: 'prevalent', band: 9, note: note('强调某种现象普遍存在。', 'A phenomenon is widespread.') },
      { text: 'widespread', band: 8 },
    ],
  },
  {
    term: 'old people',
    kind: 'phrase',
    alternatives: [
      { text: 'the elderly', band: 8 },
      { text: 'senior citizens', band: 8 },
      { text: 'older adults', band: 7 },
    ],
  },
  {
    term: 'a lot of',
    kind: 'phrase',
    alternatives: [
      { text: 'a considerable number of', band: 8, note: note('只接可数复数名词，如 people / students。', 'Only before countable plurals such as people or students.') },
      { text: 'a great deal of', band: 8, note: note('只接不可数名词，如 money / research / time。', 'Only before uncountable nouns such as money, research or time.') },
      { text: 'numerous', band: 8, note: note('后接可数复数名词。', 'Followed by a countable plural noun.') },
    ],
    reason: note('a lot of 偏口语；请根据后面的名词选择可数或不可数表达。', 'A lot of is conversational. Choose the alternative that matches the noun that follows.'),
  },
  {
    term: 'more and more',
    kind: 'phrase',
    alternatives: [
      { text: 'an increasing number of', band: 8, note: note('后接可数复数名词。', 'Followed by a countable plural noun.') },
      { text: 'increasingly', band: 8, note: note('后接形容词或动词，如 increasingly common。', 'Before an adjective or verb, as in increasingly common.') },
    ],
    reason: note('这个短语本身没有错，但拆分成更精确的表达更符合学术语域。', 'This phrase is not wrong, but a more precise split expression suits academic register.'),
  },
  {
    term: 'nowadays',
    kind: 'phrase',
    alternatives: [
      { text: 'In contemporary society', band: 8 },
      { text: 'At present', band: 7 },
    ],
    reason: note('开头常用词；换成更正式的时间状语，避免模板感。', 'A common opener. A more formal time phrase reduces the template feel.'),
  },
  {
    term: 'in my opinion',
    kind: 'phrase',
    alternatives: [
      { text: 'From my perspective', band: 8 },
      { text: 'In my view', band: 7 },
    ],
  },
  {
    term: 'I think',
    kind: 'phrase',
    alternatives: [
      { text: 'I would argue that', band: 8, note: note('后接完整从句；语气比 I think 更坚定。', 'Followed by a full clause; more assertive than I think.') },
      { text: 'It seems to me that', band: 7 },
    ],
  },
  {
    term: 'for example',
    kind: 'phrase',
    alternatives: [
      { text: 'For instance', band: 7 },
      { text: 'A case in point is', band: 9, note: note('后接名词或名词短语，需要重写句子结构。', 'Followed by a noun phrase; requires restructuring the sentence.') },
    ],
  },
  {
    term: 'in conclusion',
    kind: 'phrase',
    alternatives: [
      { text: 'To conclude', band: 8 },
      { text: 'Overall', band: 8 },
    ],
  },
  {
    term: 'firstly',
    kind: 'phrase',
    alternatives: [
      { text: 'First and foremost', band: 8 },
      { text: 'To begin with', band: 8 },
    ],
  },
  {
    term: 'secondly',
    kind: 'phrase',
    alternatives: [
      { text: 'Furthermore', band: 8 },
      { text: 'In addition', band: 8 },
    ],
  },
  {
    term: 'lastly',
    kind: 'phrase',
    alternatives: [
      { text: 'Finally', band: 7 },
      { text: 'Ultimately', band: 8 },
    ],
  },
  {
    term: 'on the other hand',
    kind: 'phrase',
    alternatives: [
      { text: 'Conversely', band: 9 },
      { text: 'By contrast', band: 8 },
    ],
    reason: note('对照逻辑连接词；仅用于真正相反或对照的观点。', 'A contrast connector; use it only for a genuinely opposing point.'),
  },
  {
    term: 'in addition',
    kind: 'phrase',
    alternatives: [
      { text: 'Furthermore', band: 8 },
      { text: 'Moreover', band: 8 },
    ],
  },
  {
    term: 'play an important role',
    kind: 'collocation',
    alternatives: [
      { text: 'play a pivotal role', band: 9 },
      { text: 'be instrumental', band: 8, note: note('要改写句式，如 be instrumental in doing。', 'Needs a structural change, as in be instrumental in doing.') },
    ],
  },
  {
    term: 'have a negative effect',
    kind: 'collocation',
    alternatives: [
      { text: 'exert a detrimental impact', band: 9 },
      { text: 'adversely affect', band: 8, note: note('后面直接接宾语，不再用 on。', 'Takes a direct object; drop the following on.') },
    ],
  },
  {
    term: 'have a positive effect',
    kind: 'collocation',
    alternatives: [
      { text: 'exert a beneficial impact', band: 9 },
      { text: 'positively influence', band: 8, note: note('后面直接接宾语，不再用 on。', 'Takes a direct object; drop the following on.') },
    ],
  },
  {
    term: 'it is important to',
    kind: 'phrase',
    alternatives: [
      { text: 'it is essential to', band: 8 },
      { text: 'it is imperative to', band: 9 },
    ],
  },
  {
    term: 'with the development of society',
    kind: 'phrase',
    alternatives: [
      { text: 'as societies evolve', band: 8 },
      { text: 'with social progress', band: 8 },
    ],
    reason: note('这句话是典型模板开头；换成有具体动作的表达更自然。', 'A template opener. A phrase with an active verb reads more naturally.'),
  },
  {
    term: 'every coin has two sides',
    kind: 'phrase',
    alternatives: [
      { text: 'every issue involves trade-offs', band: 8 },
      { text: 'most issues have both merits and drawbacks', band: 8 },
    ],
    reason: note('谚语式表达在 Task 2 中偏口语；用学术概括替代。', 'Proverbial language is too conversational for Task 2; use an academic generalisation.'),
  },
  {
    term: 'last but not least',
    kind: 'phrase',
    alternatives: [
      { text: 'Finally', band: 7 },
      { text: 'Ultimately', band: 8 },
    ],
    reason: note('模板感较强的过渡语；Finally 更简洁。', 'A template-like transition; Finally is more concise.'),
  },
  {
    term: 'in a nutshell',
    kind: 'phrase',
    alternatives: [
      { text: 'In summary', band: 8 },
      { text: 'Overall', band: 8 },
    ],
  },
  {
    term: 'due to the fact that',
    kind: 'phrase',
    alternatives: [
      { text: 'because', band: 7 },
      { text: 'since', band: 7 },
    ],
    reason: note('冗长表达；一个连词就够。', 'Wordy; a single conjunction is enough.'),
  },
  {
    term: 'very important',
    kind: 'phrase',
    alternatives: [
      { text: 'crucial', band: 8 },
      { text: 'essential', band: 8 },
      { text: 'indispensable', band: 9 },
    ],
  },
  {
    term: 'very good',
    kind: 'phrase',
    alternatives: [
      { text: 'excellent', band: 8 },
      { text: 'highly beneficial', band: 8 },
    ],
  },
  {
    term: 'very bad',
    kind: 'phrase',
    alternatives: [
      { text: 'detrimental', band: 8 },
      { text: 'severely harmful', band: 8 },
    ],
  },
  {
    term: 'very big',
    kind: 'phrase',
    alternatives: [
      { text: 'substantial', band: 8 },
      { text: 'enormous', band: 8 },
    ],
  },
  {
    term: 'very small',
    kind: 'phrase',
    alternatives: [
      { text: 'negligible', band: 9 },
      { text: 'marginal', band: 8 },
    ],
  },
  {
    term: 'very difficult',
    kind: 'phrase',
    alternatives: [
      { text: 'challenging', band: 8 },
      { text: 'demanding', band: 8 },
    ],
  },
  {
    term: 'very useful',
    kind: 'phrase',
    alternatives: [
      { text: 'invaluable', band: 9 },
      { text: 'highly practical', band: 8 },
    ],
  },
  {
    term: 'very many',
    kind: 'phrase',
    alternatives: [
      { text: 'numerous', band: 8 },
      { text: 'a considerable number of', band: 8 },
    ],
  },
]

export const REASON_DEFAULTS = {
  word: WORD_REASON,
  phrase: PHRASE_REASON,
  collocation: PHRASE_REASON,
}

export const NOTE_DEFAULT = DEFAULT_NOTE

/** Map a lower-cased term to its strongest alternatives, used for repetition tips. */
export const UPGRADE_INDEX = new Map(
  UPGRADE_ENTRIES.map((entry) => [
    entry.term.toLowerCase(),
    {
      alternatives: entry.alternatives.map((alternative) => alternative.text),
      kind: entry.kind,
    },
  ]),
)
