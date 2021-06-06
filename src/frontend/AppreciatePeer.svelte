<script>
import { writable, derived } from 'svelte/store'
import {
  tokens,
  nullToken,
  reduceAlignment,
} from '../constants'
import moment from 'moment'
export let peer
export let ondone
const selectedToken = writable(tokens[tokens.length - 1])
const fireAndReset = clear => {
  if (typeof ondone !== 'function') throw new Error('ondone is not a function')
  const token = $selectedToken
  $selectedToken = tokens[tokens.length - 1]
  ondone(clear ? $selectedToken.value : token.value)
}
const alignment = derived(peer, $p => reduceAlignment($p))

</script>
<appreciator>
  {#if $peer}
    <dialogue>
    <h2 class="flex row space-between">
      <span>{$peer.alias}</span>
      <span>
        O:{$alignment[0]}
        H:{$alignment[1]}
        C:{$alignment[2]}
      </span>
      <span>Lv{$peer.level}</span>
    </h2>
    <ul class="minimalist">
      <li>{$peer.tagline}
      <li>HEARD: 24 May 2021</li>
      <li>SEEN: {moment(new Date($peer.date)).fromNow()}</li>
      <li>
      </li>
    </ul>
      <div class="flex column xcenter">
        {#if $selectedToken === nullToken}
          <p>Pick a vibe</p>
          <br/>
        {:else}
          <h3>{$selectedToken.name}</h3>
          <div>{$selectedToken.desc}</div>
        {/if}
        <tokens>
        {#each tokens as token}
          <t on:click="{() => $selectedToken = token}" class:selected="{$selectedToken === token}">
          {token.icon}
          </t>
        {/each}
        </tokens>
      </div>
      <br/>
      <div class="flex row">
        <button on:click="{() => fireAndReset(1)}" class="alt fillx">clear</button>
        <button on:click="{() => fireAndReset(0)}" class="fillx" style="margin-left: 2px;">set</button>
      </div>
    </dialogue>
  {/if}
</appreciator>
<style>
  tokens {
    display: inline-grid;
    grid-template-rows: repeat(3, 1fr);
    grid-template-columns: repeat(3, 1fr);
    column-gap: 10px;
    row-gap: 10px;
    justify-items: center;
    align-items: center;
  }
  tokens t {
    display: inline-block;
    background-image: none;
    border: 3px dotted var(--lcdfg);
    text-align: center;
    vertical-align: middle;
    line-height: 1.5em;
    width: 1.5em;
    height: 1.5em;
    font-size: 2em;
    border-radius: 100%;
  }
  tokens t.selected {
    background-image: radial-gradient(circle, var(--lcdfg) 65%, transparent 0%);
    background-repeat: no-repeat;
  }
  dialogue {
    display: block;
    border: var(--lcdborder);
    padding: 1em;
  }
</style>
