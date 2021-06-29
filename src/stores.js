import { writable, readable, derived } from 'svelte/store'
import Kernel from './blockend/kernel'
import levelup from 'levelup'
import leveljs from 'level-js'
// function levelup(e) { return e }
// function leveljs() {}
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

export const balance = readable([0, 0, 0], set => {
  kernel.store.on('assets', () => {
    if (!kernel.balance) return
    set(kernel.balance)
  })
})

// global error handler
export const lastError = writable(null)
export function error (msg, err) {
  if (!err && typeof msg !== 'string') return error('╮(︶︿︶)╭', msg)
  lastError.set({ err, msg })
  console.error(msg, err)
}
