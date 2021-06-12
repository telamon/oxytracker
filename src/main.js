import App from './frontend/App.svelte'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

const app = new App({
  target: document.body,
  props: {

  }
})

export default app
