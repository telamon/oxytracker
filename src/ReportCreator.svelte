<script>
import { writable } from 'svelte/store'
import { addressBook, tokens } from './stores'
import AppreciatePeer from './AppreciatePeer.svelte'
const mood = writable(2)
const interactions = writable([])
const search = writable('')
const pickedPeer = writable(null)
const rumors = writable([])

const tokenAssigned = octet => {
  const rumor = $rumors.find(r => r.peer === $pickedPeer.pk)
  if (rumor) {
    rumor.token = octet
  } else if (octet !== null) {
    $rumors.push({ peer: $pickedPeer.pk, token: octet })
  }
  $rumors = $rumors.filter(p => p.token !== null)
  $pickedPeer = null
  console.log(JSON.stringify($rumors, null , 2))
}
</script>
<section>
  What's up?
  {$mood}
  <div>
    <button on:click={() => $mood = 0}>0</button>
    <button on:click={() => $mood = 1}>1</button>
    <button on:click={() => $mood = 2}>2</button>
    <button on:click={() => $mood = 3}>3</button>
  </div>
  <input type="search" bind:value={$search}/>
  <AppreciatePeer peer={pickedPeer} ondone={tokenAssigned}/>
  <peers>
    {#each $addressBook as peer}
      <peer on:click={() => $pickedPeer = peer}>
        <portrait>
          <alias>{peer.alias}</alias>
          {#if $rumors.find(r => r.peer === peer.pk )}
            <token>{tokens[$rumors.find(r => r.peer === peer.pk).token].icon}</token>
          {/if}
        </portrait>
      </peer>
    {/each}
  </peers>
</section>
<style>
  peers {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }
  peer { display: inline-block; }
  peers portrait {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: purple;
    width: 4em;
    height: 4em;
    border-radius: 100%;
  }
  portrait alias {
    display: block;
    font-size: 1.2em;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 1em;
  }
</style>
