const test = require('tape')
const Feed = require('picofeed')
const levelup = require('levelup')
const memdown = require('memdown')
const Kernel = require('../src/kernel')
const PicoStore = require('../src/pico-store')
const DB = () => levelup(memdown())

test('load', async t => {
  try {
    const app = new Kernel(DB())
    const loggedIn = await app.load()
    t.notOk(loggedIn, 'Database is empty')
    t.notOk(app.ready)
    const registered = await app.register({
      alias: 'k70k',
      tagline: 'Where insantiy meets the ocean'
    })
    t.ok(registered, 'state initialized')
    t.ok(app.ready)
    console.log('Generated new profile', app.pk.hexSlice(0, 8))
  } catch (err) { t.error(err) }
  t.end()
})

test('Append report', async t => {
  try {
    const alice = Feed.signPair()
    const bob = Feed.signPair()
    const app = new Kernel(DB())
    await app.load()
    await app.register({ alias: 'k70k' })
    let feed = await app.feed()
    t.equal(feed.length, 1)
    const done = await app.appendReport(
      1, // Mood
      [ // Rumors/tokens
        { pk: alice.pk, token: 2 },
        { pk: bob.pk, token: 0 }
      ]
    )
    t.ok(done)
    feed = await app.feed()
    t.equal(feed.length, 2)
    t.deepEqual(app.profile.perspective, [2, 0])
    t.deepEqual(app.store.state.peers[alice.pk.hexSlice()].reputation, [2])
  } catch (err) { t.error(err) }
  t.end()
})

test('profile', async t => {
  t.plan(4)
  try {
    const app = new Kernel(DB())
    await app.register({ alias: 'k70k', tagline: 'RRRR' })
    const p = app.profile
    t.equal(p.alias, 'k70k', 'exports alias')
    t.equal(p.tagline, 'RRRR', 'exports tagline')
    t.ok(p.date, 'exports created at date')
    t.ok(app.pk.equals(p.pk), 'exports public key')
  } catch (err) { t.error(err) }
  t.end()
})

test('addressBook', async t => {
  t.plan(4)
  const a = new Kernel(DB())
  const b = new Kernel(DB())
  await a.register({ alias: 'A', tagline: 'test' })
  await b.register({ alias: 'B', tagline: 'disco' })
  t.notOk(await a.findProfileBlock(b.pk), 'B profile not found in A')
  const f = new Feed()
  f.merge(await b.findProfileBlock(b.pk))
  await a.dispatch(f) // Transfer block to a
  t.ok(await a.findProfileBlock(b.pk), 'B profile found in A')
  const bprof = a.store.state.peers[b.pk.hexSlice()]
  t.equal(bprof.alias, 'B')
  t.equal(bprof.tagline, 'disco')
  t.end()
})

test('pico-stack/store/carnival', async t => {
  const db = DB()
  const store = new PicoStore(db)
  const validator = ({ state, block }) => {
    const n = JSON.parse(block.body)
    if (n <= state) return true
  }
  const reducer = ({ state, block }) => {
    return JSON.parse(block.body)
  }
  store.register('counter', 5, validator, reducer)
  await store.load()

  t.equal(store.state.counter, 5)

  // Create mutation
  const { sk } = Feed.signPair()
  const mutations = new Feed()
  mutations.append(JSON.stringify(7), sk)
  let changed = await store.dispatch(mutations)
  t.ok(changed.find(s => s === 'counter'))
  t.equal(store.state.counter, 7)

  // Try to restore previously persisted state
  const store2 = new PicoStore(db)
  store2.register('counter', 5, validator, reducer)
  await store2.load()
  t.equal(store2.state.counter, 7)

  // Disqualified mutation does not affect state
  mutations.append(JSON.stringify(2), sk)
  mutations.append(JSON.stringify(10), sk)
  changed = await store2.dispatch(mutations)
  t.equal(changed.length, 0)
  t.equal(store2.state.counter, 7)
  mutations.truncate(1) // remove bad blocks
  mutations.append(JSON.stringify(12), sk)

  changed = await store2.dispatch(mutations)
  t.equal(changed.length, 1)
  t.equal(store2.state.counter, 12)

  // Purge and rebuild state from scratch
  changed = await store.reload()
  t.equal(changed.length, 1)
  t.equal(store.state.counter, 12)

  t.end()
})
