/**
 * PicoStore - picofeed powered blockchain state reducer (blockend)
 * Compatible with what ever frontend framework you wish to use.
 *
 * The reduced state is always persisted and consistent across reloads and
 * application restarts. (Automatically restores in-memory state from DB)
 *
 * Works in browser and nodejs using leveldb and IndexedDB. (levelup)
 * Use `memdown` in unit-tests.
 *
 * USAGE:
 *
 * // Initialize a new store using
 * const db = ... // level-dbs-like-interface
 * const store = new PicoStore(db)
 *
 * // Define a block-validator function,
 * // that checks if a block can be applied given content, author / something.
 * const canMutate = ({ state, block }) => {
 *   // Extract value from block
 *   const n = JSON.parse(block.body)
 *
 *   // New value is valid if higher than previous value
 *   if (n <= state) return true
 * }
 *
 * // Define a state reducer
 * const reducer = ({ state, block }) => {
 *   // returns new state of counter
 *   return JSON.parse(block.body)
 * }
 *
 * // Registers the counter store with 5 being initial state.
 * store.register('counter', 5, canMutate, reducer)
 *
 * console.log(store.state.counter) // => 5
 *
 * // Mutate the state by creating a new feed and dispatching it.
 * const { sk } = Feed.signPair()
 * const mutations = new Feed()
 *
 * // append new value as a transaction
 * mutations.append(JSON.stringify(7), sk)
 *
 * // dispatch the transactions
 * let changed = await store.dispatch(mutations)
 *
 * // dispatch returns a list of registers that were modified by the feed
 * console.log(changed) // => ['counter']
 *
 * // state is mutated.
 * console.log(store.state.counter) // => 7
 */
const PicoRepo = require('./pico-repo')
const Feed = require('picofeed')

class PicoStore {
  constructor (db, mergeStrategy) {
    this.repo = db instanceof PicoRepo ? db : new PicoRepo(db)
    this._strategy = mergeStrategy || (() => {})
    this._stores = []
    this._loaded = false
  }

  register (name, initialValue, validator, reducer) {
    if (this._loaded) throw new Error('register() must be invoked before load()')
    if (typeof name !== 'string') {
      return this.register(name.name, name.initialValue, name.filter, name.reducer)
    } else if (typeof initialValue === 'function') {
      return this.register(name, undefined, initialValue, validator)
    }

    this._stores.push({
      name,
      validator,
      reducer,
      version: 0,
      head: undefined,
      value: initialValue,
      initialValue,
      observers: []
    })
  }

  async load () {
    if (this._loaded) return
    for (const store of this._stores) {
      const head = await this.repo.readReg(`HEADS/${store.name}`)
      if (!head) continue // Empty
      store.head = head
      store.version = JSON.parse(await this.repo.readReg(`VER/${store.name}`))
      store.value = decodeValue(await this.repo.readReg(`STATES/${store.name}`))
      for (const listener of store.observers) listener(store.value)
    }
    this._loaded = true
  }

  async dispatch (patch) {
    const modified = []
    patch = Feed.from(patch)
    // Check if head can be fast-forwarded
    const local = (await this.repo.loadHead(patch.last.key)) || new Feed()
    let n = 0
    const canMerge = local.merge(patch, (block, abort) => {
      let valid = true
      for (const store of this._stores) {
        if (typeof store.validator === 'function') {
          valid = valid && !store.validator({ block, state: store.value })
          if (!valid) abort()
        }
      }
      if (valid) n++
    })
    if (!canMerge) return modified

    const mutations = local.slice(-n)

    for (const block of mutations.blocks()) {
      const mod = await this._mutateState(block)
      for (const s of mod) {
        if (!~modified.indexOf(s)) modified.push(s)
      }
    }
    return modified
  }

  async _mutateState (block) {
    const modified = []
    for (const store of this._stores) {
      if (typeof store.validator === 'function') {
        if (store.validator({ block, state: store.value })) return modified
      }

      if (typeof store.reducer !== 'function') continue
      const val = store.reducer({ block, state: store.value })
      if (typeof val === 'undefined') continue
      await this.repo.merge(block, this._strategy)
      await this.repo.writeReg(`STATES/${store.name}`, encodeValue(val))
      await this.repo.writeReg(`HEADS/${store.name}`, block.sig)
      await this.repo.writeReg(`VER/${store.name}`, JSON.stringify(store.version++))
      // who needs a seatbelt anyway? let's save some memory.
      store.value = val // Object.freeze(val)
      store.head = block.sig
      for (const listener of store.observers) listener(store.value)
      if (!~modified.indexOf(store.name)) modified.push(store.name)
    }
    return modified
  }

  get state () {
    return this._stores.reduce((state, store) => {
      state[store.name] = store.value
      return state
    }, {})
  }

  async reload () {
    const modified = []
    const peers = await this.repo.listHeads()

    for (const store of this._stores) {
      store.value = store.initialValue
      store.version = 0
      store.head = undefined
      for (const listener of store.observers) listener(store.value)
    }

    for (const { key, value: ptr } of peers) {
      let done = false
      while (!done) {
        const part = await this.repo.loadFeed(ptr)
        // TODO: Multiparent resolve chains and prioritize
        // paths that lead to `key` (peer id) genesis
        for (const block of part.blocks()) {
          const mods = await this._mutateState(block)
          for (const s of mods) {
            if (!~modified.indexOf(s)) modified.push(s)
          }
          // if (block.isGenesis) done = true
          // else ptr = some other reference
        }
        done = true
      }
    }
    return modified
  }

  on (name, observer) {
    const store = this._stores.find(s => s.name === name)
    if (!store) throw new Error(`No such store: "${name}"`)
    if (typeof observer !== 'function') throw new Error('observer must be a function')
    store.observers.push(observer)
    observer(store.value)
    return () => { // unsub
      store.observers.splice(store.observers.indexOf(observer), 1)
    }
  }
}

function encodeValue (val) {
  return JSON.stringify(val)
}

function decodeValue (val) {
  return JSON.parse(val)
}

module.exports = PicoStore
