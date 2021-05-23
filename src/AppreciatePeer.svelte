<script>
import { writable } from 'svelte/store'
import { tokens } from './stores'
export let peer
export let ondone
const selectedToken = writable(tokens[tokens.length - 1])
const fireAndReset = clear => {
  if (typeof ondone !== 'function') throw new Error('ondone is not a function')
  const token = $selectedToken
  $selectedToken = tokens[tokens.length - 1]
  ondone(clear ? $selectedToken.value : token.value)
}
</script>
<appreciator>
  {#if $peer}
    <dialogue>
      <h3>{$peer.alias}</h3>
      <div class="flex column xcenter">
        <p>Pick a vibe</p>
        <tokens>
        {#each tokens as token}
          <t on:click="{() => $selectedToken = token}" class:selected="{$selectedToken === token}">
          {token.icon}
          </t>
        {/each}
        </tokens>
      </div>
      <h4>{$selectedToken.name}</h4>
      <div>{$selectedToken.desc}</div>
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
  appreciator {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  dialogue {
    display: block;
    border: var(--lcdborder);
    /*
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: gray;
    border: 1px solid black;
    border-radius: 4px;
    */
    padding: 1em;
  }
</style>
