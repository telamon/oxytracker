<script>
// export let name
import vd from 'vidar'
import { onMount } from 'svelte'
import { writable, derived } from 'svelte/store'
let canvas;
let video;
let movie;
let files;
const recording = writable(null)
onMount(() => {
  movie = new vd.Movie(canvas, { repeat: true })
    .addLayer(new vd.layer.Visual(0, Infinity, { background: 'black' }))
    .addLayer(new vd.layer.Video(0, video)
      // .addEffect(new vd.effect.ChromaKey(vd.parseColor('black'), 100))
    )
  vd.event.subscribe(movie, 'movie.ended', ev => {
    console.log('movie.ended', ev)
    if (movie.paused) movie.play()
  })
  vd.event.subscribe(movie, 'movie.timeupdate', ev => {
    // console.log('movie.timeupdate', ev)
  })
})
function resizeMovie () {
  const aspect =  video.videoHeight / video.videoWidth
  const width = Math.min(video.videoWidth, $screenDimensions.width)
  console.log('New dims: ', width, aspect * width)
  movie.width = width
  movie.height = aspect * width
}
const startRecording = () => {
  navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
    video.srcObject = stream
    video.onloadedmetadata = () => {
      resizeMovie()
      movie.addLayer(new vd.layer.Video(0, video)
        .addEffect(new vd.effect.ChromaKey(vd.parseColor('black'), 100)))
      if (movie.paused) movie.play()
    }
  })
}
function loopClip () {
  console.log('loopClip()')
  if (!movie.paused) movie.stop()
  movie.play().then(loopClip)
    .catch(console.error.bind(null, 'Play failed'))
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
      resizeMovie()
      loopClip()
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
