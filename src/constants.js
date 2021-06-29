const TYPE_PROFILE = 0
const TYPE_REPORT = 1
const TYPE_PACT = 2
const TYPE_TRANSACTION = 3

// ASSETS
const A_ORD = 0
const A_HRM = 1
const A_CHS = 2

//    ROLE      CHO
const T_HLR = 0b010
const T_TNK = 0b001
const T_THF = 0b100
const T_WAR = 0b011
const T_BER = 0b110
const T_PAL = 0b111
const T_SNT = 0b101
const T_NPC = 0b000

const tokens = [
  {
    name: 'Healer',
    desc: 'Makes you feel normal for a while',
    icon: '🌿', // '🩹',
    value: T_HLR,
    karma: 1
  },
  {
    name: 'Tank',
    desc: 'Shoulders your pain',
    icon: '🛡️',
    value: T_TNK,
    karma: 1.5
  },
  {
    name: 'Thief',
    desc: 'Pleasently steals your secrets',
    icon: '🗡️',
    value: T_THF,
    karma: 0.5
  },
  {
    name: 'Warrior',
    desc: 'Fights by your side',
    icon: '⚔️',
    value: T_WAR,
    karma: 1.25
  },
  {
    name: 'Berserker',
    desc: 'Challenges your sanity',
    icon: '🪓',
    value: T_BER,
    karma: 0.75
  },
  {
    name: 'Paladin',
    desc: 'All over the place',
    icon: '🔨',
    value: T_PAL,
    karma: 1
  },
  {
    name: 'Saint',
    desc: 'Gives the gift you need',
    icon: '🙏',
    value: T_SNT,
    karma: 2
  },
  {
    name: 'NPC', // Zombie / Succubus / Vampire / NPC
    desc: 'Non playable character',
    icon: '🧟',
    value: T_NPC,
    karma: 0
  },
  {
    name: 'X',
    desc: 'Not interacted with',
    icon: '❌',
    value: null,
    karma: 0
  }
]
const nullToken = tokens[tokens.length - 1]
const tokenOf = tokens.reduce((lut, t) => {
  lut[t.value] = t
  return lut
}, [])

// helpers.js
function reduceAlignment (reputation) {
  const out = [0, 0, 0]
  if (!reputation) return out
  for (const rep of reputation) {
    out[0] += rep & 1
    out[1] += (rep >> 1) & 1
    out[2] += (rep >> 2) & 1
  }
  return out
}

function unpackToken (rep) {
  return [
    rep & 1,
    (rep >> 1) & 1,
    (rep >> 2) & 1
  ]
}

module.exports = {
  // Blocktypes
  TYPE_PROFILE,
  TYPE_REPORT,
  TYPE_PACT,
  TYPE_TRANSACTION,

  // Token octets
  T_HLR,
  T_TNK,
  T_THF,
  T_WAR,
  T_BER,
  T_PAL,
  T_SNT,
  T_NPC,

  // Asset constants
  A_ORD,
  A_HRM,
  A_CHS,

  // Lookup Tables
  tokens,
  nullToken,

  // Helpers
  tokenOf,
  reduceAlignment,
  unpackToken
}
