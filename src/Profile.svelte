<script>
import { kernel } from './stores'
import PicoQR from './PicoQR.svelte'
const profile = kernel.profile
</script>
<profile>
<h2>Profile</h2>
  <h3>{$profile.alias}</h3>
  <small>{$profile.tagline}</small>
  <key>{$profile.pk.slice(0, 8).toString('hex')}</key>
  <PicoQR baseUri="https://oxytox.me/#r," feed="{kernel.personalFeed}" />
</profile>
<style>

</style>
