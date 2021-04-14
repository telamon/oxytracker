<script>
import Player from './Player.svelte'
import { writable, derived, get } from 'svelte/store'
import { saveAs } from 'file-saver';
const MAX_HEIGHT = 480 // 854
const MAX_WIDTH = MAX_HEIGHT * (480 / 854) // 480
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
  let end = $e >= $s + toxDuration ? $e : $d
  return { start, end }
})

const isEncoding = writable(false)
const encodingProgress = derived([isEncoding, safeRange, currentTime], ([$e, range, time]) => {
  if (!$e) return 0
  return (time - range.start) / (range.end - range.start)
})
const outputURL = writable(null)
/*
onMount(() => {
  vLayer = new vd.layer.Video({
    source: video,
    startTime: 0,
    duration: 2,
    destWidth: MAX_WIDTH,
    destHeight: MAX_HEIGHT
  })
  safeRange.subscribe(r => {
    console.log('Duration change', r)
    vLayer.duration = r.end
    vLayer.startTime = r.start
  })
  movie = new vd.Movie({ canvas, repeat: true })
    .addLayer(vLayer)
  // repeat: true flag does nothing, workaround for looping
  // the clip
  vd.event.subscribe(movie, 'movie.ended', ev => {
    // console.log('movie.ended', ev)
    $playbackEnded = true
  })
  vd.event.subscribe(movie, 'movie.timeupdate', ev =>
    $currentTime = ev.movie.currentTime )
})
*/

// resetPlayback when currentTime exceeds safe end
/*
$: {
  if (currentTime && (safeRange.end < currentTime)) {
    resetPlayback(safeRange.start)
      .catch(err => console.error('Critical error, err handler sanity failed', err))
  }
}*/
// resetPlayback when on `movie.ended` event.
$: {
  if ($playbackEnded) {
    $playbackEnded = false // Reset counter
    resetPlayback(0)
      .catch(err => console.error('Critical error, err handler sanity failed', err))
  }
}

async function resetPlayback (start) {
  console.log(`resetPlayback(${start})`)
  try {
    movie.stop()
    await movie.setCurrentTime(start, false)
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
    movie.width = MAX_WIDTH // width / aspect
    movie.height = MAX_HEIGHT // height
  }
  console.log('New dims: ', movie.width, movie.height)
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
      // debugger
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

function exportRecording () {
  movie.stop()
  $isEncoding = true
  movie.record({ frameRate: 60 })
    .then(blob => {
      console.log('Blob', blob)
      // $outputURL = URL.createObjectURL(blob)
      // setTimeout(function () { URL.revokeObjectURL(a.href) }, 4E4) // 40s // https://github.com/eligrey/FileSaver.js/blob/master/src/FileSaver.js
      movie.stop()
      movie.play()
      $isEncoding = false
      saveAs(blob)
    })
}

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
  <Player url={recording} />
  <input bind:value={$cropStart} type="number"/>
  <input bind:value={$cropEnd} type="number"/>
  <pre>{$currentTime}</pre>
  <canvas	bind:this={canvas} />
  <br/>
  <input bind:files
    accept="video/*"
    type="file"/>
  <button on:click={startRecording}>Record</button>
  {#if $isEncoding}
    <h3>Encoding... {Math.floor($encodingProgress * 100)}%</h3>
  {:else}
    <button on:click={exportRecording}>Share</button>
  {/if}
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
