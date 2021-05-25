<script>
import ReportCreator from './ReportCreator.svelte'
import Profile from './Profile.svelte'
import { kernel, error, lastError } from './stores'
import { writable } from 'svelte/store'
import { onMount } from 'svelte'
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
  .catch(err => error('Registration Failed', err))
}
const inspectFeed = () => {
  kernel.feed()
    .then(f => f.inspect())
    .catch(err => error('Failed loading feed', err))
}
// TODO: dirty drop-in due to removal of crappy svelte-navigator dep.
// I wish more people thought serverless
const mode = writable(0)
onMount(() => {
  // window.onunhandledrejection = error
})
</script>

<tomodachi150>
<brand>¤ TOMODACHI 150 ¤<stripes>\\\</stripes></brand>
  <lcd>
    {#if $lastError}
      <h2>500 エロール/ERROR</h2>
      <h3>{$lastError.msg}</h3>
      <div>{$lastError.err.message}</div>
      <div>{$lastError.err.stack}</div>
    {:else if $loading === 0}
      <progress value="70" max="100">70 %</progress>
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
          Name<br/>
          <input type="text" bind:value="{$tmpAlias}"/>
        </p>
        <p>
          Pickup line<br/>
          <input type="text" bind:value="{$tmpTagline}"/>
        </p>
        <button class="fillx" on:click="{register}">done!</button>
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
            You pressed the wrong button.<br/>
            Try again and be more gentle this time.<br/>
            <br/>
            ヾ( ￣O￣)ツ
          </p>
      {/if}
    {:else}
      <h2>TOMODACHI150 WA SHINDERU (D:)</h2>
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
</tomodachi150>
<style>
</style>
