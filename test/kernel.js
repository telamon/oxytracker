const test = require('tape')
const Feed = require('picofeed')
const levelup = require('levelup')
const memdown = require('memdown')
const Kernel = require('../src/kernel')

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
})

test('Append report', async t => {
  try {
    const alice = Feed.signPair()
    const bob = Feed.signPair()
    const app = new Kernel(DB())
    await app.register({ alias: 'k70k' })
    let feed = await app.feed()
    t.equal(feed.length, 1)
    const done = await app.appendReport(
      0, // Mood
      [ // Rumors/tokens
        { pk: alice.pk, token: 2 },
        { pk: bob.pk, token: 0 }
      ]
    )
    t.ok(done)
    feed = await app.feed()
    feed.inspect()
    t.equal(feed.length, 2)
  } catch (err) { t.error(err) }
})
