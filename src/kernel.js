const Feed = require('picofeed')
const Repo = require('./pico-repo')
const KEY_SK = 'reg/sk'
const TYPE_PROFILE = 0
const TYPE_REPORT = 1

class Kernel {
  constructor (db) {
    this.db = db
    this.repo = new Repo(db)

    // Make integration with svelte easier
    // by exporting some reduced state as reactive stores.
    this.profile = store({
      pk: null,
      alias: null,
      tagline: null
    })
  }

  async load () {
    this._sk = await this.db.get(KEY_SK)
      .catch(err => {
        if (!err.notFound) throw err
      })
    if (!this._sk) return false
    // repo.
    this.profile._set({
      pk: this.pk,
      alias: 'kek',
      tagline: 'bobkl'
    })
    return true
  }

  get ready () {
    return !!this._sk
  }

  get pk () {
    return this._sk.slice(32)
  }

  async register (profile) {
    const { sk } = Feed.signPair()
    const f = new Feed()
    const str = Buffer.from(JSON.stringify(profile))
    const data = Buffer.alloc(1 + str.length)
    str.copy(data, 1)
    str[0] = TYPE_PROFILE
    f.append(data, sk)
    const res = await this.repo.merge(f, this._mergeObserver)
    if (!res) throw new Error('Failed persisting profile')
    await this.db.put(KEY_SK, sk)
    return await this.load()
  }

  async feed () {
    this._checkReady()
    return this.repo.loadHead(this.pk)
  }

  async appendReport (mood = 0, rumors = []) {
    const f = await this.feed()
    const data = Buffer.from(JSON.stringify({
      date: new Date().getTime(),
      mood,
      rumors: rumors.map(r => ({ ...r, pk: r.pk.hexSlice() }))
    }))
    const buffer = Buffer.alloc(1 + data.length)
    data.copy(buffer, 1)
    buffer[0] = TYPE_REPORT
    f.append(buffer, this._sk)
    const merged = await this.repo.merge(f, this._mergeObserver)
    if (!merged) throw new Error('Failed to create report')
    return true
  }

  _checkReady () {
    if (!this.ready) throw new Error('Kernel is not ready, still loading or user is not registerd')
  }

  /**
   * TODO: method is wrongy provided to store as strategy.
   * strategy's are only used in case of multi-head merge-conflict.
   * Game-rules shold be handeled by feed.append(block, validator)
   * - Max 1 report per day
   * - Max 5 tokens per day
   * - Max 1 token per peer
   */
  async _mergeObserver (block, repo) {
    console.info('Running observer', block, repo)
    debugger
    this.profile._set(0)
    return true
  }
}
// pico-store.js
// Nano sized reactive store
function store (value, setter) {
  const subs = []
  const dispatch = () => {
    for (const cb of subs) cb(value)
  }
  /*
  if (typeof setter !== 'function') {
    console.error('[ERROR!] Redundant store, set method not provided')
    throw new Error('RedundantStore')
  }
  */
  const _set = v => {
    if (v === value) return
    value = v
    dispatch()
  }
  setter && setter(_set) // export set method

  return {
    _set,
    subscribe: cb => {
      subs.push(cb)
      cb(value)
      return () => {
        const idx = subs.indexOf(cb)
        if (idx !== -1) subs.splice(idx, 1)
      }
    }
  }
}
module.exports = Kernel
