import { Store } from 'vuex';
import { Client } from '../../../cumulonimbus-wrapper';

declare module '@vue/runtime-core' {
  // declare your own store states
  interface State {
    client: Client | null;
  }

  // provide typings for `this.$store`
  interface ComponentCustomProperties {
    $store: Store<State>;
  }
}
