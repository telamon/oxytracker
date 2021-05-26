<script>
import QR from 'qrcode-generator'
import { onMount } from 'svelte'
export let data
export let size = 2
export let margin = 0
export let level = 'L'
export let colorDark = '#000' // '#253900'
export let colorLight = '#808000'
let imgElem

onMount(() => {
  return data.subscribe(f => {
    if (!f) return
    // TODO: hack to modify colors,
    // maybe use qr.drawToContext() + canvas instead of img.
    const qr = new QR(0, level)
    qr.addData(f)
    qr.make()
    const url = qr.createDataURL(size, margin)
    imgElem.src = url
  })
})
</script>
<pico-qr>
  <img bind:this="{imgElem}"/>
</pico-qr>
<style>
  pico-qr { display: block; }
</style>
