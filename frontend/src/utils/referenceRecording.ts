import { analyzeSignal, SignalFeatures } from './audioAnalysis';

const DEFAULT_REFERENCE_DURATION_MS = 4000;

const stopStream = (stream: MediaStream) => {
  stream.getTracks().forEach((track) => track.stop());
};

export const recordHummingReference = async (durationMs = DEFAULT_REFERENCE_DURATION_MS): Promise<SignalFeatures> => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const audioContext = new AudioContext();
  const source = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;
  source.connect(analyser);

  const buffer = new Float32Array(analyser.fftSize);
  const startTime = performance.now();

  let samplesCollected = 0;
  let totalRms = 0;
  let totalFrequency = 0;
  let frequencySamples = 0;

  return new Promise((resolve, reject) => {
    let stopped = false;

    const cleanup = () => {
      if (stopped) {
        return;
      }
      stopped = true;
      stopStream(stream);
      void audioContext.close();
    };

    const finalize = () => {
      cleanup();
      resolve({
        rms: samplesCollected > 0 ? totalRms / samplesCollected : 0,
        frequency: frequencySamples > 0 ? totalFrequency / frequencySamples : null
      });
    };

    const handleError = (error: unknown) => {
      cleanup();
      reject(error);
    };

    const sample = () => {
      try {
        analyser.getFloatTimeDomainData(buffer);
        const { rms, frequency } = analyzeSignal(buffer, audioContext.sampleRate);
        totalRms += rms;
        samplesCollected += 1;
        if (frequency) {
          totalFrequency += frequency;
          frequencySamples += 1;
        }
      } catch (error) {
        handleError(error);
        return;
      }

      if (performance.now() - startTime >= durationMs) {
        finalize();
      } else {
        requestAnimationFrame(sample);
      }
    };

    sample();
  });
};
