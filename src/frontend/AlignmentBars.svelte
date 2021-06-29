<script>
import { onMount } from 'svelte'
import { derived } from 'svelte/store'
import { reduceAlignment } from '../constants'
export let tokens = null
export let size = 150
let canvasElement = null
let ctx = null
const totals = derived(tokens, ($t, set) => {
  if (!$t) return
  const [order, harmony, chaos] = reduceAlignment($t)
  set({ order, harmony, chaos })
})
onMount(() => {
  canvasElement.style.width = `${size}px`
  canvasElement.style.height = `${size}px`
  ctx = canvasElement.getContext('2d')
  return tokens.subscribe(t => {
    if (!t) return
    const alignment = reduceAlignment(t)
    const max = Math.max(...alignment)
    let o = 0, h = 0, c = 0
    if (max !== 0) {
      o = alignment[0] / max
      h = alignment[1] / max
      c = alignment[2] / max
    }

    const s = v => size * v
    const v = y => size * 0.75 * y + 0.12
    const drawTriangle = (o, h, c) => {
      ctx.beginPath()
      ctx.moveTo(s(0.5), v(1 - h))
      ctx.lineTo(s(c), v(1))
      ctx.lineTo(s(1 - o), v(1))
      ctx.lineTo(s(0.5), v(1- h))
      ctx.closePath()
    }
    console.log(alignment, o, h, c)
    ctx.fillStyle = '#253900'
    ctx.strokeStyle = '#253900'
    // draw border
    ctx.lineWidth = 1
    ctx.beginPath()
    drawTriangle(1, 1, 1)
    ctx.stroke()
    // TODO: draw all time
    // TODO: draw 2 weeks back
    // TODO: draw past week
    // Draw current week
    drawTriangle(o, h, c)
    ctx.fill()
  })
})
</script>
<alignment-bars class="flex column center">
  <div class="flex row center">
    <small>{$totals.harmony} Harmony</small>
  </div>
  <div class="flex row center">
    <canvas bind:this={canvasElement} width={size} height={size}/>
  </div>
  <div class="flex row space-between">
      <small>{$totals.order} Order</small>
      <small>{$totals.chaos} Chaos</small>
  </div>
</alignment-bars>
<style>
  canvas {
    aspect-ratio: 1 / 1;
    width: 100%;
  }
</style>
