<script>
import { AwesomeQR as AQR } from 'awesome-qr'
import { onMount } from 'svelte'
export let baseUri
export let feed
export let size = 318
export let margin = 0
export let colorDark = '#000' // '#253900'
export let colorLight = '#808000'
let imgElem

onMount(() => {
  return feed.subscribe(f => {
    if (!f) return
    new AQR({
      text: baseUri + f.slice(1).pickle(),
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
