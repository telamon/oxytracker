<script>
import { writable, derived } from 'svelte/store'
import dayjs from 'dayjs'
import {
  kernel,
  addressBook,
  profile,
} from '../stores'
import {
  tokens,
  reduceAlignment,
  tokenOf
} from '../constants'
import AppreciatePeer from './AppreciatePeer.svelte'

// Report creation states
const mood = writable(-1)
const interactions = writable([])
const search = writable('')
const pickedPeer = writable(null)
const rumors = writable([])
const isStaging = writable(false)

const tokenAssigned = octet => {
  const rumor = $rumors.find(r => r.pk === $pickedPeer.pk)
  if (rumor) {
    rumor.token = octet
  } else if (octet !== null) {
    $rumors.push({ pk: $pickedPeer.pk, token: octet })
  }
  $rumors = $rumors.filter(p => p.token !== null)
  $pickedPeer = null
}
const commitDay = () => {
  kernel.appendReport($mood, $rumors)
    .then(() => {
      $isStaging = false
      $rumors = []
    })
    .catch(err => console.error('Failed appendReport()', err))
}

const todayDone = derived(profile, ($p, set) => {
  const f = 'YYYYMMDD'
  set(dayjs().format(f) === dayjs($p.lastReport).format(f))
})
</script>
<section>
  {#if !$isStaging && !$pickedPeer}
    <h2 class="flex row space-between">
      <div>Peers</div>
      <div>Day {dayjs().diff($profile?.awokenAt, 'days')}</div>
      <!-- week since awaken, days with consequtive reports -->
      <pill>{$addressBook.length}</pill>
    </h2>
    {#if $addressBook.length}
      <peers>
        {#each $addressBook as peer}
          <peer on:click={() => $pickedPeer = peer}>
            <portrait>
              <alias>{peer.alias}</alias>
              <level class="text-right">Lv{peer.level}</level>
              {#if $rumors.find(r => r.pk === peer.pk )}
                <token>{tokenOf[$rumors.find(r => r.pk === peer.pk).token].icon}</token>
              {/if}
              <alignment class="text-right">{reduceAlignment(peer.reputation).join('/')}</alignment>
            </portrait>
          </peer>
        {/each}
      </peers>
    <div>
      <input type="search" bind:value="{$search}" placeholder="search" class="fillx"/>
    </div>
    <div>
      <button disabled={$todayDone}
              on:click={() => $isStaging = true} class="fillx">
              End day
      </button>
    </div>
    {:else}
      <excuse class="flex column center xcenter text-center">
        <h3>┐(￣ヮ￣)┌</h3>
        <p>
          The situation is very sad,<br/>
          your TOMODACHI150 is empty.
          <br/>
          <br/>
          Scan a friends QR-code or ask them to send you their Magic Link
        </p>
      </excuse>
    {/if}
  {:else if $isStaging && !$pickedPeer}
    <h2>Day Summary</h2>
    <staging-area>
      <div>{new Date()}</div>
      <h3 class="text-center">What's up?</h3>
      <div class="flex row space-around">
        <slime on:click={() => $mood = 2} class:selected="{$mood === 2}"><t>:<small>D</small></t></slime>
        <slime on:click={() => $mood = 1} class:selected="{$mood === 1}"><t>:<small>&gt;</small></t></slime>
        <slime on:click={() => $mood = -1} class:selected="{$mood === -1}"><t>:<small>/</small></t></slime>
        <slime on:click={() => $mood = -2} class:selected="{$mood === -2}"><t>:<small>(</small></t></slime>
      </div>
      <br/>
      Summary:
      <summary class="flex column">
        {#each $rumors as rumor}
          <rumor>
          {$addressBook.find(p => p.pk === rumor.pk)?.alias}
          +{tokenOf[rumor.token].icon} {tokenOf[rumor.token].name}
          </rumor>
        {/each}
      </summary>
      <br/>
      <ctrls>
        <button on:click={() => $isStaging = false} class="alt">cancel</button>
        <button on:click={commitDay}>commit</button>
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
    /*
     overflow-y: scroll;
     height: 10em;
    */
  }
  peer { display: block; }
  peers portrait {
    display: grid;
    grid-template-columns: 1.5em 2fr 1fr 3em ;
    grid-template-rows: 1fr;
    grid-template-areas: "token alias stats lvl";
    /*
    flex-direction: row;
    justify-content: space-between;
    */
    align-items: center;
    border: var(--lcdborder);
    padding: 4px;
    margin: 2px 0;
  }
  portrait alias {
    grid-area: alias;
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
  alignment {
    font-size: smaller;
    font-weight: normal;
    grid-area: stats;
  }
  level { grid-area: lvl; }
  summary { border: var(--lcdborder); }
</style>
