import type { SourceAdapter } from './models';
import { ayalTaarogAdapter } from './ayal-taarog/adapter';
import { levMeirIsraelAdapter } from './levmeirisrael/adapter';

export const ADAPTERS: SourceAdapter[] = [levMeirIsraelAdapter, ayalTaarogAdapter];
