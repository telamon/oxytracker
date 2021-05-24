<script>
import { kernel } from './stores'
const profile = kernel.profile
</script>
<profile>
<h2>Profile</h2>
  {JSON.stringify(Object.keys($profile))}
  <h3>Alias: {$profile.alias}</h3>
  <p>Tagline {$profile.tagline}</p>
  <key>{$profile.pk.toString('hex')}</key>
</profile>
<style>
</style>
