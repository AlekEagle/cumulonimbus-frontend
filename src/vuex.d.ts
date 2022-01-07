import { Store } from 'vuex';
import { Client } from '../../../cumulonimbus-wrapper';
import { Cumulonimbus } from '../../cumulonimbus-wrapper';

declare module '@vue/runtime-core' {
  // declare your own store states
  interface State {
    client: Client | null;
    session: Cumulonimbus.Data.Session | null;
    user: Cumulonimbus.Data.User | null;
    filePage: number | null;
  }

  // provide typings for `this.$store`
  interface ComponentCustomProperties {
    $store: Store<State>;
  }
}
