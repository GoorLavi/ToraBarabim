import { useMutation } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import type { PanelLoginResponse } from '@torabarabim/common';

import { login, PanelApiError } from './api';

export const usePanelLogin = (): UseMutationResult<
  PanelLoginResponse,
  PanelApiError,
  { identifier: string; password: string; from?: string }
> => useMutation({ mutationFn: login });
