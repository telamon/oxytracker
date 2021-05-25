<script>
import { AwesomeQR as AQR } from 'awesome-qr'
import { onMount } from 'svelte'
export let data
export let size = 318
export let margin = 0
export let colorDark = '#000' // '#253900'
export let colorLight = '#808000'
let imgElem

onMount(() => {
  return data.subscribe(f => {
    if (!f) return
    new AQR({
      text: f,
      size,
      margin,
      colorLight,
      colorDark
    })
      .draw()
      .then(url => imgElem.src = url)
      .catch(err => console.error('Failed to paint QR-code', err))
  })
})
</script>
<pico-qr>
  <img bind:this="{imgElem}"/>
</pico-qr>
<style>
  pico-qr { display: block; }
</style>
