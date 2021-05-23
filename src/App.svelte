<script>
import { Router, Route, Link } from 'svelte-navigator'
import ReportCreator from './ReportCreator.svelte'
// eslint-disable-next-line import/no-extraneous-dependencies
// import { createHashHistory } from 'history'
function createHashSource(basename) {
 //  const history = createHashHistory({ basename })
  const history = window.history
  let listeners = []

  history.listen(location => {
    if (history.action === "POP") {
      listeners.forEach(listener => listener(location))
    }
  })

  return {
    get location() {
      return history.location
    },
    addEventListener(name, handler) {
      if (name !== "popstate") return
      listeners.push(handler)
    },
    removeEventListener(name, handler) {
      if (name !== "popstate") return
      listeners = listeners.filter(fn => fn !== handler)
    },
    history: {
      get state() {
        return history.location.state
      },
      pushState(state, title, uri) {
        history.push(uri, state)
      },
      replaceState(state, title, uri) {
        history.replace(uri, state)
      },
      go(to) {
        history.go(to)
      },
    },
  }
}
</script>

<tomodachi150>
<brand>TOMODACHI 150 <stripes>\\\</stripes></brand>
  <Router>
    <lcd>
        <Route path="/" primary="{false}">
          <ReportCreator></ReportCreator>
        </Route>
        <Route path="/profile">Profile</Route>
        <Route path="/timeline">Timeline</Route>
        <Route path="/create-record">
        </Route>
    </lcd>
    <nav>
      <Link to="/">Peers</Link>
      <Link to="/timeline">Scan pk</Link>
      <Link to="/profile">Profile</Link>
      <Link to="/create-record">Add</Link>
    </nav>
  </Router>
</tomodachi150>
<style>
</style>
