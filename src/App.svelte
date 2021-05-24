<script>
import { Router, Route, Link } from 'svelte-navigator'
import ReportCreator from './ReportCreator.svelte'
import Profile from './Profile.svelte'
import { kernel } from './stores'
import { writable } from 'svelte/store'

// eslint-disable-next-line import/no-extraneous-dependencies
// import { createHashHistory } from 'history'
function createHashSource(basename) {
 //  const history = createHashHistory({ basename })
  const history = window.history
  let listeners = []

  history.listen(location => {
    if (history.action === "POP") {
      listeners.forEach(listener => listener(location))
    }
  })

  return {
    get location() {
      return history.location
    },
    addEventListener(name, handler) {
      if (name !== "popstate") return
      listeners.push(handler)
    },
    removeEventListener(name, handler) {
      if (name !== "popstate") return
      listeners = listeners.filter(fn => fn !== handler)
    },
    history: {
      get state() {
        return history.location.state
      },
      pushState(state, title, uri) {
        history.push(uri, state)
      },
      replaceState(state, title, uri) {
        history.replace(uri, state)
      },
      go(to) {
        history.go(to)
      },
    },
  }
}
const loading = writable(0)
const tmpAlias = writable('')
const tmpTagline = writable('')
// Attempt to load previous state
const loadKernel = () => {
  kernel.load()
    .then(r => loading.set(r ? 3 : 1))
    .catch(err => {
      console.error(err)
      loading.set(-1)
    })
}
loadKernel()
const register = () => {
  kernel.register({
    alias: $tmpAlias,
    tagline: $tmpTagline
  })
  .then(r => loading.set(r ? 3 : 1))
  .catch(err => {
    console.error(err)
    loading.set(-1)
  })
}
</script>

<tomodachi150>
<brand>¤ TOMODACHI 150 ¤<stripes>\\\</stripes></brand>
  <Router>
    <lcd>
      {#if $loading === 0}
      {:else if $loading === 1}
        <div class="flex column space-between xcenter">
          <small>v1.0.0</small>
          <h1 class="text-center">
            OXytOX<br/>
            ٩(◕‿◕｡)۶ („• ֊ •„)<br/>
            ペール アップ
          </h1>
          <small>(Peer up!)</small>
          <h1><button on:click="{() => $loading = 2}">Start</button></h1>
          <small>2021 © Decent Labs - All wrongs reversed</small>
        </div>
      {:else if $loading === 2}
        <registration class="flex column fillx">
          <h2>Register profile <small>(100% offline)</small></h2>
          <p>
            Alias<br/>
            <input type="text" bind:value="{$tmpAlias}"/>
          </p>
          <p>
            Tagline<br/>
            <input type="text" bind:value="{$tmpTagline}"/>
          </p>
          <button class="fillx" on:click="{register}">done!</button>
        </registration>
      {:else if $loading === 3}
        <Route path="/" primary="{false}">
          <ReportCreator></ReportCreator>
        </Route>
        <Route path="/profile">
          <Profile></Profile>
        </Route>
        <Route path="/timeline">Timeline</Route>
        <Route path="/create-record">
        </Route>
      {:else}
        <h2>TOMODACHI150 WA SHINDERU (D:)</h2>
        <p>
          We regret to inform that
          something went horribly wrong
          and we've lost contact with everyone
          you ever knew. They should of course still
          be alive but there's really no way to tell.
          The backup feature is not yet
          implemented nor have we made any secret copies of your private key.
          We're sorry to say this but you're effed,
          yup. Completley, utterly and hoplelessly effed.
          Do pop the console please and make a bugreport somewhere.
          <br/>
          <br/>
          Sincerect of Apologies<br/>
          on behalf of
          the 70Kth King of Cryptonia<br/>
          - King70K
        </p>
      {/if}
    </lcd>
    <nav>
      <Link to="/">Peers</Link>
      <Link to="/timeline">Happy</Link>
      <Link to="/profile">Wallet</Link>
      <Link to="/create-record">Rx Tx</Link>
    </nav>
  </Router>
</tomodachi150>
<style>
</style>
