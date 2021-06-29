<script>
import { A_ORD, A_HRM, A_CHS } from '../constants'
import { balance } from '../stores'
</script>
<wallet class="flex column">
  <h2>Coins</h2>
  <div class="flex column space-between">
    <div>
      <!--<h3>Game tokens</h3>-->
      <div class="flex row space-around">
        <coin class="flex column xcenter o">
          <small>Order</small>
          <t>👊</t>
          <n>{$balance[A_ORD]}</n>
        </coin>
        <coin class="flex column xcenter h">
          <small>Harmony</small>
          <t>✌️</t>
          <n>{$balance[A_HRM]}</n>
        </coin>
        <coin class="flex column xcenter c">
          <small>Chaos</small>
          <t>❤️</t>
          <n>{$balance[A_CHS]}</n>
        </coin>
      </div>
    </div>
    <div class="flex column end">
      <!--
      <h3>Real currency</h3>
      <div class="flex row space-around">
        <coin class="flex column xcenter o">
          <small>Karma</small>
          <t>⏳</t>
          <n>{$balance[2]}</n>
        </coin>
        </div>
      -->
      <button>Pay</button>
      <button>Request</button>
      <button>History</button>
    </div>
</wallet>
<style>
  coin n {
    font-size: larger;
    display: block;
  }
  coin t {
    margin: 0.3em;
    background-color: darkgoldenrod;
    border: 5px outset gold;
    border-radius: 100%;
    font-size: 2em;
    padding: 0.2em 0.3em;
  }
</style>
