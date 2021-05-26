<script>
import ReportCreator from './ReportCreator.svelte'
import Profile from './Profile.svelte'
import { kernel, error, lastError } from './stores'
import { writable } from 'svelte/store'
const loading = writable(0)
const tmpAlias = writable('')
const tmpTagline = writable('')
// Attempt to load previous state
const loadKernel = () => {
  kernel.load()
    .then(r => loading.set(r ? 3 : 1))
    .catch(err => error('Loading kernel failed', err))
    .then(async () => { // Attempt to merge URL-blocks
      if (!window.location.hash.startsWith('#m,PIC0')) return
      const pickle = window.location.hash.slice(3)
      const mut = await kernel.dispatch(pickle)
      console.log('Registers mutated:', ...mut)
      window.location.hash = '#/'
    })
    .catch(err => error('Add peer failed', err))
}
loadKernel()
// TODO: dirty drop-in due to removal of crappy svelte-navigator dep.
// I wish more people thought serverless
const mode = writable(0)

const handleResize = () => {
}
const globError = err => {
  console.error('globError', err)
}
const globReject = ev => {
  ev.preventDefault()
  ev.promise.catch(err => error('BORK! Uncaught rejection', err))
}

const register = () => {
  kernel.register({
    alias: $tmpAlias,
    tagline: $tmpTagline
  })
  .then(r => loading.set(r ? 3 : 1))
  .catch(err => error('Registration Failed', err))
}
const inspectFeed = () => {
  kernel.feed()
    .then(f => f.inspect())
    .catch(err => error('Failed loading feed', err))
}
const reloadKernel = () => {
  kernel.store.reload()
    .catch(err => error('Failed reloading kernel', err))
}
const clearDatabase = () => {
  kernel.store.destroy()
    .catch(err => error('Failed destorying database', err))
}
</script>

<tomodachi150>

<brand>¤ TOMODACHI 150 ¤<stripes>\\\</stripes></brand>
  <lcd>
    {#if $lastError}
      <h2>500 エロール/ERROR</h2>
      <h3>{$lastError.msg}</h3>
      <div>{$lastError.err.message}</div>
      <div class="error-stack">{$lastError.err.stack}</div>
      <button on:click="{() => $lastError = null}">dismiss</button>
    {:else if $loading === 0}-->
      <h2>Bootloader</h2>
      <p>
        <small>
          Zeroing out RAM...done!<br/>
          Loading kernel...<br/>
          &gt; Cryptonix 15.0.1
          &gt; MOTD: nothing is as it seems
          $ cd..<br/>
          hs: cd.. command not found
          $ /sbin/dc<br/>
          Internet disconnected sucessfully<br/>
          $ /sbin/hypup<br/>
          Bootstrapping hyperspace connection...<br/>
          Failed! Hypermodem not implemented<br/>
          $ /sbin/restore<br/>
          Initializing blockstore.......done!<br/>
          Deserializing states...fail!<br/>
          Replaying time...<br/>
        </small>
      </p>

      <progress value="70" max="100" class="block fillx">70 %</progress>
    {:else if $loading === 1}
      <div class="flex column space-between">
        <small class="text-right">v1.0.0</small>
        <h1 class="text-center">
          <div class="flex row center xend"><small>HYPER</small>&nbsp;OX<small>yt</small>OX&nbsp;<small>TURBO</small></div>
          <div class="vs">
            <div class="flex row start">(„• ֊ •„)</div>
            <small>VS</small>
            <div class="flex row end">٩(◕‿◕｡)۶</div>
          </div>
          <div class="flex row center">ペール アップ</div>
        </h1>
        <small class="text-center">(Peer up!)</small>
        <h1 class="text-center"><button on:click="{() => $loading = 2}">Start</button></h1>
        <footer class="text-center"><small>2021 © Decent Labs - All wrongs reversed</small></footer>
      </div>
    {:else if $loading === 2}
      <registration class="flex column fillx filly space-between">
        <h2>Register profile <small>(100% offline)</small></h2>
        <div>
          Name<br/>
          <input type="text" bind:value="{$tmpAlias}"/>
        </div>
        <p>&nbsp;</p>
        <div>
          Pickupline
        </div>
        <textarea bind:value="{$tmpTagline}" class="block"></textarea>
        <p>&nbsp;</p>
        <button class="fillx" on:click="{register}">submit</button>
      </registration>
    {:else if $loading === 3}
      {#if $mode === 0}
        <ReportCreator></ReportCreator>
      {:else if $mode === 1}
        <Profile></Profile>
      {:else if $mode === 2}
        <h2>Timeline</h2>
      {:else}
        <h2>404 エロール/ERROR</h2>
          <p class="text-center">
            ヾ( ￣O￣)ツ
            <br/>
            <br/>
            You pressed the wrong button.<br/>
            Try again and be more gentle this time.<br/>
          </p>
      {/if}
    {:else}
      <h2>TOMODACHI150 WA MO SHINDERU (D:)</h2>
      <!-- <p>
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
      </p> -->

    {/if}
  </lcd>
  <nav>
    <a on:click="{() => $mode = 0}" href="#/">Peers</a>
    <a on:click="{() => $mode = 1}" href="#/timeline">Me</a>
    <a on:click="{() => $mode = 2}" href="#/profile">Wallet</a>
    <a on:click="{() => $mode = 3}" href="#/repl">Rx Tx</a>
  </nav>
  <mysteryButton on:click="{inspectFeed}">o</mysteryButton>
  <mysteryButton on:click="{reloadKernel}">o</mysteryButton>
  <mysteryButton on:click="{clearDatabase}">o</mysteryButton>
</tomodachi150>
<svelte:window
                 on:resize|passive={handleResize}
                 on:error={globError}
                 on:unhandledrejection={globReject}
                 />
<style>
  .vs {
    border: var(--lcdborder);
    padding: 1em 0em;
  }
  .vs div { line-height: 0.5em; }
  .error-stack {
    font-weight: normal;
    font-size: smaller;
  }
</style>
