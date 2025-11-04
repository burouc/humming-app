export interface SignalFeatures {
  rms: number;
  frequency: number | null;
}

const MIN_RMS_FOR_FREQUENCY = 0.01;

const computeRms = (buffer: Float32Array) => {
  let sumSquares = 0;
  for (let i = 0; i < buffer.length; i += 1) {
    const sample = buffer[i];
    sumSquares += sample * sample;
  }
  return Math.sqrt(sumSquares / buffer.length);
};

const estimateFrequency = (buffer: Float32Array, sampleRate: number) => {
  let zeroCrossings = 0;
  let lastSample = buffer[0];
  for (let i = 1; i < buffer.length; i += 1) {
    const currentSample = buffer[i];
    if ((lastSample >= 0 && currentSample < 0) || (lastSample < 0 && currentSample >= 0)) {
      zeroCrossings += 1;
    }
    lastSample = currentSample;
  }

  const estimatedFrequency = (zeroCrossings * sampleRate) / (2 * buffer.length);
  return Number.isFinite(estimatedFrequency) && estimatedFrequency > 0 ? estimatedFrequency : null;
};

export const analyzeSignal = (buffer: Float32Array, sampleRate: number): SignalFeatures => {
  const rms = computeRms(buffer);
  if (rms < MIN_RMS_FOR_FREQUENCY) {
    return { rms, frequency: null };
  }

  const frequency = estimateFrequency(buffer, sampleRate);
  return { rms, frequency };
};
