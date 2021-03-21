<script>
// export let name
import vd from 'vidar'
import { onMount } from 'svelte'
import { writable, derived, get } from 'svelte/store'
let canvas;
let video;
let movie;
let files;
const cropStart = writable(0)
const cropEnd = writable(Infinity)
const recordingDuration = writable(Infinity)
const recording = writable(null)
const currentTime = writable(0)
const playbackEnded = writable(false)
const safeRange = derived([cropStart, cropEnd, recordingDuration], ([$s, $e, $d]) => {
  // ensure range within duration without overlap.
  const toxDuration = 1
  let start = $s + toxDuration < $d ? Math.max($s, 0) : 0
  let end = $e < $s + toxDuration ? $e : $d
  return { start, end }
})

onMount(() => {
  movie = new vd.Movie({ canvas, repeat: true })
    // .addLayer(new vd.layer.Visual(0, Infinity, { background: 'black' }))
    .addLayer(new vd.layer.Video({ startTime: 0, source: video })
      // .addEffect(new vd.effect.ChromaKey(vd.parseColor('black'), 100))
    )
  // repeat: true flag does nothing, workaround for looping
  // the clip
  vd.event.subscribe(movie, 'movie.ended', ev => {
    // console.log('movie.ended', ev)
    $playbackEnded = true
  })

  vd.event.subscribe(movie, 'movie.timeupdate', ev =>
    $currentTime = ev.movie.currentTime )
})

// resetPlayback when currentTime exceeds safe end
$: {
  if (currentTime && (safeRange.end < currentTime)) {
    resetPlayback(safeRange.start)
      .catch(err => console.error('Critical error, err handler sanity failed', err))
  }
}
// resetPlayback when on `movie.ended` event.
$: {
  if ($playbackEnded) {
    $playbackEnded = false // Reset counter
    resetPlayback($safeRange.start)
      .catch(err => console.error('Critical error, err handler sanity failed', err))
  }
}

async function resetPlayback (start) {
  console.log(`resetPlayback(${start})`)
  try {
    await movie.setCurrentTime(start, false)
    movie.stop()
    await movie.play()
  } catch (err) {
    console.error('resetPlayback() failed:', err)
  }
}

function resizeMovie () {
  const aspect =  video.videoHeight / video.videoWidth
  const width = Math.min(video.videoWidth, $screenDimensions.width)
  const height = Math.min(video.videoHeight, $screenDimensions.height)
  if (width > height && false) {
    movie.width = width
    movie.height = aspect * width
  } else {
    // TODO: this dosen't seem to have an effect.
    movie.width = 240 // width / aspect
    movie.height = 420 // height
  }
  console.log('New dims: ', width, aspect * width)
  movie.width = width
  movie.height = aspect * width
}

const startRecording = () => {
  navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
    video.srcObject = stream
    video.onloadedmetadata = () => {
      $recordingDuration = Infinity // It's a live stream... this is wrong design
      resizeMovie()
      movie.addLayer(new vd.layer.Video({ startTime: 0, source: video }))
      if (movie.paused) movie.play()
    }
  })
}

// File upload watcher
$: if (files) {
  const file = files[0]
  if (file) recording.set(URL.createObjectURL(file))
}
recording.subscribe(url => {
  console.log('Sub triggered new recording', url)
  if (url && video) {
    video.onloadedmetadata = () => {
      console.log('video.onloadedmetadata')
      $recordingDuration = video.duration
      resizeMovie()
      resetPlayback(0)
    }
    video.src = url
  }
  else if (video || url) console.warn('Cannot load recording, missing either video', video, 'or file', url)
})

const screenDimensions = writable({
  width: window.innerWidth,
  height: window.innerWidth,
  ratio: window.devicePixelRatio
})

function handleResize () {
  const dimensions = {
    width: window.innerWidth,
    height: window.innerWidth,
    ratio: window.devicePixelRatio
  }
  console.info('Screen dimension updates', dimensions)
  screenDimensions.set(dimensions)
}
function globError (err) {
  debugger
  console.error(err)
}
</script>

<main>
  <video style="display:none" bind:this={video}>
    <track kind="captions">
  </video>
  <pre>{$currentTime}</pre>
  <canvas	bind:this={canvas} />
  <br/>
  <input bind:files
    accept="video/*"
    type="file"/>
  <button on:click={startRecording}>Record</button>
</main>
<svelte:window on:resize|passive={handleResize} on:error={globError} />

<style>
	main {
		text-align: center;
		margin: 0 auto;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
