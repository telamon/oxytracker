import { writable, readable, derived } from 'svelte/store'
import Kernel from './kernel'
import levelup from 'levelup'
import leveljs from 'level-js'
// function levelup(e) { return e }
// function leveljs() {}

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

export const addressBookFake = readable([ // move to stores.js
  {
    alias: 'Alice',
    pk: 0,
    alignment: [1, 3, 7],
    level: 7
  },
  {
    alias: 'Bobatron',
    pk: 1,
    alignment: [7, 1, 2],
    level: 8
  },
  {
    alias: 'Centrifudge',
    pk: 2,
    alignment: [1, 3, 1],
    level: 3
  },
  {
    alias: 'Dunbarrel',
    pk: 3,
    alignment: [2, 6, 1],
    level: 2
  },
  {
    alias: 'Echelobster',
    pk: 4,
    alignment: [3, 5, 2],
    level: 4
  },
  {
    alias: 'Phishman',
    pk: 5,
    alignment: [1, 3, 6],
    level: 5
  }
])

const DB = levelup(leveljs('oxytox'))
export const kernel = new Kernel(DB)
export const profile = readable({}, set => {
  kernel.store.on('peers', peers => {
    if (kernel.pk) set(peers[kernel.pk.toString('hex')])
  })
})
export const peers = readable({}, set => {
  kernel.store.on('peers', set)
})
export const addressBook = derived(peers, ($peers, set) => {
  const list = []
  const selfPk = kernel.pk.toString('hex')
  for (const key of Object.keys($peers)) {
    if (selfPk === key) continue // ignore self
    list.push($peers[key])
  }
  set(list)
})

// global error handler
export const lastError = writable(null)
export function error (msg, err) {
  if (!err && typeof msg !== 'string') return error('╮(︶︿︶)╭', msg)
  lastError.set({ err, msg })
  console.error(msg, err)
}

// helpers.js
export function reduceAlignment (peer) {
  const out = [0, 0, 0]
  if (!peer) return out
  for (const rep of peer.reputation) {
    out[0] += rep & 1
    out[1] += (rep >> 1) & 1
    out[2] += (rep >> 2) & 1
  }
  return out
}
