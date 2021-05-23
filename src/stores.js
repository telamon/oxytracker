import { writable, readable } from 'svelte/store'

export const tokens = [
  {
    name: 'Healer',
    desc: 'Makes you feel normal for a while',
    icon: '🌿', // '🩹',
    value: 0
  },
  {
    name: 'Tank',
    desc: 'Shoulders your pain',
    icon: '🛡️',
    value: 1
  },
  {
    name: 'Thief',
    desc: 'Pleasently steals your secrets',
    icon: '🗡️',
    value: 2
  },
  {
    name: 'Warrior',
    desc: 'Fights by your side',
    icon: '⚔️',
    value: 3
  },
  {
    name: 'Berserker',
    desc: 'Challenges your sanity',
    icon: '🪓',
    value: 4
  },
  {
    name: 'Paladin',
    desc: 'All over the place',
    icon: '🔨',
    value: 5
  },
  {
    name: 'Saint',
    desc: 'Gives the gift you need',
    icon: '🙏',
    value: 6
  },
  {
    name: 'NPC', // Zombie / Succubus / Vampire / NPC
    desc: 'Non playable character',
    icon: '🧟',
    value: 7
  },
  {
    name: 'X',
    desc: 'Not interacted with',
    icon: '❌',
    value: null
  }
]

export const addressBook = readable([ // move to stores.js
  {
    alias: 'Alice',
    pk: 0,
    alignment: [1, 3, 7]
  },
  {
    alias: 'Bobatron',
    pk: 1,
    alignment: [7, 1, 2]
  },
  {
    alias: 'Centrifudge',
    pk: 2,
    alignment: [1, 3, 1]
  },
  {
    alias: 'Dunbarrel',
    pk: 3,
    alignment: [2, 6, 1]
  },
  {
    alias: 'Echelobster',
    pk: 4,
    alignment: [3, 5, 2]
  },
  {
    alias: 'Phishman',
    pk: 5,
    alignment: [1, 3, 6]
  }
])
