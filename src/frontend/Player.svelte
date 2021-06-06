<script>
import vd from 'vidar'

import { onMount } from 'svelte'
export let url
export let duration = 2
export let start = 0

const MAX_HEIGHT = 480 // 854
const MAX_WIDTH = MAX_HEIGHT * (480 / 854) // 480

let videoElement = null
let canvasElement = null

class MuteVideo extends vd.layers.VisualSourceMixin(vd.layers.Visual) {}

onMount(() => {
  const layer = new MuteVideo({
    source: videoElement,
    startTime: $start,
    duration: $duration,
    destWidth: MAX_WIDTH,
    destHeight: MAX_HEIGHT
  })
  const movie = new vd.Movie({ canvasElement, repeat: true })
    .addLayer(layer)

  /* TODO: Figure out a way to unsubscribe.
  vd.event.subscribe(movie, 'movie.ended', ev => {
    // console.log('movie.ended', ev)
    $playbackEnded = true
  })
  vd.event.subscribe(movie, 'movie.timeupdate', ev =>
    $currentTime = ev.movie.currentTime)*/

  const subscriptions = [
    duration.subscribe(sec => layer.duration = sec)
    start.subscribe(sec => layer.start = sec)
    url.subscribe(loadURL)
  ]
  return () => {
    for (const unsub of subscriptions) unsub()
    movie.stop()
    while (movie.layers.length) movie.layers.pop()
  }
})

function loadURL (url) {
  console.info('Loading video-url', url)
  if (url && videoElement) {
    videoElement.onloadedmetadata = () => {
      console.log('video.onloadedmetadata')
      $recordingDuration = video.duration
      resetPlayback()
    }
    videoElement.src = url
  } else if (videoElement || url) {
    console.warn('Cannot load recording, missing either video', video, 'or file', url)
  }
}
</script>

<section>
  <video style="display:none" bind:this={videoElement}>
    <track kind="captions"/>
  </video>
  <canvas bind:this={canvasElement}/>
</section>
