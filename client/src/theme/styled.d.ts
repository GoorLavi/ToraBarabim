import 'styled-components';

import type { Theme } from './models';

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}
