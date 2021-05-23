<script>
import { writable } from 'svelte/store'
import { tokens } from './stores'
export let peer
export let ondone
const selectedToken = writable(tokens[tokens.length - 1])
const fireAndReset = () => {
  if (typeof ondone !== 'function') throw new Error('ondone is not a function')
  const token = $selectedToken
  $selectedToken = tokens[tokens.length - 1]
  ondone(token.value)
}
</script>
<appreciator>
  {#if $peer}
    <dialogue>
      <h3>{$peer.alias}</h3>
      <p>Pick a vibe</p>
      <tokens>
      {#each tokens as token}
        <t on:click={() => $selectedToken = token}>
          {token.icon}
        </t>
      {/each}
      </tokens>
      <h4>{$selectedToken.name}</h4>
      <div>{$selectedToken.desc}</div>
      <button on:click={fireAndReset}>done</button>
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
    background-color: #394a4a;
    text-align: center;
    width: 1.5em;
    height: 1.5em;
    font-size: 3em;
    border-radius: 100%;
  }
  appreciator {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  dialogue {
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: gray;
    border: 1px solid black;
    border-radius: 4px;
    padding: 1em;
  }
</style>
