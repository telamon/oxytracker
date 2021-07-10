<script>
import { readable, writable, derived } from 'svelte/store'
import { kernel, profile, error } from '../stores'
import AlignmentBars from './AlignmentBars.svelte'
import PicoQR from './PicoQR.svelte'
const vCard = readable(undefined, set => {
  kernel.findProfileBlock(kernel.pk)
    .then(f => {
      const { host: h, protocol: p } = window.location
      set(`${p}//${h}/#m,` + f.pickle())
    })
    .catch(err => error('Failed findProfileBlock()', err))
})
const mode = writable(2)
const tokens = derived(profile, ($p, set) => set($p?.perspective || []))
</script>
<profile>
<h2>Profile</h2>
  <h3>{$profile.alias}</h3>
  <!-- store serialization breaks buffers.
    <key>Key {$profile.pk}</key>
  -->
  <p>{$profile.tagline}</p>
  <nav class="flex row space-between">
    <button on:click="{() => $mode = 0}" class:alt="{$mode === 0}">Perspective</button>
    <button on:click="{() => $mode = 1}" class:alt="{$mode === 1}">Reputation</button>
    <button on:click="{() => $mode = 2}" class:alt="{$mode === 2}">vCard</button>
  </nav>
  {#if $mode === 0}
    <AlignmentBars tokens={tokens} />
    {JSON.stringify($profile, null, 2)}
  {:else if $mode === 2}
    <p class="flex row center"><a href="{$vCard}">Magic Link</a></p>
    <small>Scan the code or share the link with a friend</small>
    <PicoQR data="{vCard}" />
  {/if}
</profile>
<style>

</style>
