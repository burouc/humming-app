import type { SignalFeatures } from './utils/audioAnalysis';

export interface HummingSettings {
  targetDurationMs: number;
  referenceProfile: SignalFeatures | null;
}
