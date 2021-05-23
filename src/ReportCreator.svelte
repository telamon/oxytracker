<script>
import { writable } from 'svelte/store'
import { addressBook, tokens } from './stores'
import AppreciatePeer from './AppreciatePeer.svelte'
const mood = writable(2)
const interactions = writable([])
const search = writable('')
const pickedPeer = writable(null)
const rumors = writable([])
const isStaging = writable(false)

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
  {#if !$isStaging && !$pickedPeer}
    <h2>Peers <pill>{$addressBook.length}</pill></h2>
    <peers >
      {#each $addressBook as peer}
        <peer on:click={() => $pickedPeer = peer}>
          <portrait>
            <alias>{peer.alias}</alias>
            <level>Lv3</level>
            <alignment>2/7/2</alignment>
            {#if $rumors.find(r => r.peer === peer.pk )}
              <token>{tokens[$rumors.find(r => r.peer === peer.pk).token].icon}</token>
            {/if}
          </portrait>
        </peer>
      {/each}
    </peers>
    <div>
      <input type="search" bind:value={$search} placeholder="search" class="fillx"/>
    </div>
    <div><button on:click={() => $isStaging = true} class="fillx">End day</button></div>
  {:else if $isStaging && !$pickedPeer}
    <h2>Day Summary</h2>
    <staging-area>
      <div>{new Date()}</div>
      What's up?
      {$mood}
      <div>
        <button on:click={() => $mood = 0} class="primary">0</button>
        <button on:click={() => $mood = 1} class="primary">1</button>
        <button on:click={() => $mood = 2} class="primary">2</button>
        <button on:click={() => $mood = 3} class="primary">3</button>
      </div>
      <ctrls>
        <button on:click={() => $isStaging = false} class="alt">cancel</button>
        <button>commit</button>
      </ctrls>
    </staging-area>
  {:else}
    <AppreciatePeer peer={pickedPeer} ondone={tokenAssigned}/>
  {/if}
</section>
<style>
  peers {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  peer { display: block; }
  peers portrait {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    border: var(--lcdborder);
    padding: 4px;
    margin: 2px 0;
  }
  portrait alias {
    display: block;
    font-size: 1.2em;
    text-overflow: ellipsis;
    /*max-width: 1em;*/
  }
  pill {
    float: right;
  }
  ctrls {
    display: flex;
    flex-direction: row;
  }
  ctrls button {
    width: 100%;
    margin: 1px;
  }

</style>
