export const tokens = [
  {
    name: 'Healer',
    desc: 'Makes you feel normal for a while',
    icon: '🌿', // '🩹',
    value: 2,
    karma: 1
  },
  {
    name: 'Tank',
    desc: 'Shoulders your pain',
    icon: '🛡️',
    value: 1,
    karma: 1.5
  },
  {
    name: 'Thief',
    desc: 'Pleasently steals your secrets',
    icon: '🗡️',
    value: 4,
    karma: 0.5
  },
  {
    name: 'Warrior',
    desc: 'Fights by your side',
    icon: '⚔️',
    value: 3,
    karma: 1.25
  },
  {
    name: 'Berserker',
    desc: 'Challenges your sanity',
    icon: '🪓',
    value: 6,
    karma: 0.75
  },
  {
    name: 'Paladin',
    desc: 'All over the place',
    icon: '🔨',
    value: 7,
    karma: 1
  },
  {
    name: 'Saint',
    desc: 'Gives the gift you need',
    icon: '🙏',
    value: 5,
    karma: 2
  },
  {
    name: 'NPC', // Zombie / Succubus / Vampire / NPC
    desc: 'Non playable character',
    icon: '🧟',
    value: 0,
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
export const nullToken = tokens[tokens.length - 1]
export const tokenOf = tokens.reduce((lut, t) => {
  lut[t.value] = t
  return lut
}, [])

// helpers.js
export function reduceAlignment (reputation) {
  const out = [0, 0, 0]
  if (!reputation) return out
  for (const rep of reputation) {
    out[0] += rep & 1
    out[1] += (rep >> 1) & 1
    out[2] += (rep >> 2) & 1
  }
  return out
}
