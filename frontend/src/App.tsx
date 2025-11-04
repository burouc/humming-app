import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BananaRewards } from './components/BananaRewards';
import { FloatingNotes } from './components/FloatingNotes';
import { HummingProgress } from './components/HummingProgress';
import { SettingsPanel } from './components/SettingsPanel';
import mammothImage from './assets/mammoth.svg';
import gearIcon from './assets/gear.svg';
import { analyzeSignal } from './utils/audioAnalysis';
import { recordHummingReference } from './utils/referenceRecording';
import type { HummingSettings } from './types';

const HUMMING_TOLERANCE_MS = 500;
const SETTINGS_STORAGE_KEY = 'humm-settings';

const DEFAULT_SETTINGS: HummingSettings = {
  targetDurationMs: 15000,
  referenceProfile: null
};

const loadSettings = (): HummingSettings => {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS;
  }

  try {
    const stored = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!stored) {
      return DEFAULT_SETTINGS;
    }

    const parsed = JSON.parse(stored) as Partial<HummingSettings>;

    return {
      targetDurationMs:
        typeof parsed.targetDurationMs === 'number' && Number.isFinite(parsed.targetDurationMs)
          ? parsed.targetDurationMs
          : DEFAULT_SETTINGS.targetDurationMs,
      referenceProfile: parsed.referenceProfile ?? DEFAULT_SETTINGS.referenceProfile
    };
  } catch (error) {
    console.warn('Unable to load stored settings', error);
    return DEFAULT_SETTINGS;
  }
};

const storeSettings = (settings: HummingSettings) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('Unable to persist settings', error);
  }
};

const App = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<HummingSettings>(() => loadSettings());
  const [progressMs, setProgressMs] = useState(0);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [listeningError, setListeningError] = useState<string | null>(null);
  const [recordingReference, setRecordingReference] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const dataArrayRef = useRef<Float32Array | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastHummingTimeRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number | null>(null);

  useEffect(() => {
    storeSettings(settings);
  }, [settings]);

  const stopListening = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }

    dataArrayRef.current = null;
    lastHummingTimeRef.current = null;
    lastUpdateRef.current = null;
    setProgressMs(0);
    setIsListening(false);
  }, []);

  const startListening = useCallback(async () => {
    try {
      setListeningError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.4;
      source.connect(analyser);

      mediaStreamRef.current = stream;
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      dataArrayRef.current = new Float32Array(analyser.fftSize);
      lastHummingTimeRef.current = null;
      lastUpdateRef.current = null;
      setProgressMs(0);
      setIsListening(true);
    } catch (error) {
      console.error('Unable to start microphone capture', error);
      setListeningError('Unable to access your microphone. Please allow microphone access.');
      stopListening();
    }
  }, [stopListening]);

  useEffect(() => {
    if (!isListening) {
      return undefined;
    }

    const analyser = analyserRef.current;
    const audioContext = audioContextRef.current;
    const buffer = dataArrayRef.current;

    if (!analyser || !audioContext || !buffer) {
      return undefined;
    }

    let isCancelled = false;

    const analyzeFrame = () => {
      if (isCancelled) {
        return;
      }

      analyser.getFloatTimeDomainData(buffer);
      const { rms, frequency } = analyzeSignal(buffer, audioContext.sampleRate);
      const now = performance.now();
      const lastUpdate = lastUpdateRef.current ?? now;
      const delta = now - lastUpdate;
      lastUpdateRef.current = now;

      const reference = settings.referenceProfile;

      const amplitudeThreshold = reference ? Math.max(reference.rms * 0.6, 0.015) : 0.025;
      let humming = rms >= amplitudeThreshold;

      if (humming && reference?.frequency) {
        if (!frequency) {
          humming = false;
        } else {
          const tolerance = reference.frequency * 0.2 + 20;
          humming = Math.abs(frequency - reference.frequency) <= tolerance;
        }
      }

      if (humming) {
        lastHummingTimeRef.current = now;
        setProgressMs((prev) => Math.min(prev + delta, settings.targetDurationMs));
      } else {
        const lastDetected = lastHummingTimeRef.current;
        if (!lastDetected || now - lastDetected > HUMMING_TOLERANCE_MS) {
          lastHummingTimeRef.current = null;
          setProgressMs((prev) => (prev > 0 ? 0 : prev));
        }
      }

      rafRef.current = requestAnimationFrame(analyzeFrame);
    };

    rafRef.current = requestAnimationFrame(analyzeFrame);

    return () => {
      isCancelled = true;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isListening, settings.referenceProfile, settings.targetDurationMs]);

  useEffect(() => () => {
    stopListening();
  }, [stopListening]);

  useEffect(() => {
    if (progressMs >= settings.targetDurationMs && settings.targetDurationMs > 0) {
      setProgressMs(0);
      lastHummingTimeRef.current = null;
      lastUpdateRef.current = null;
      setCompletedSessions((sessions) => Math.min(sessions + 1, 3));
    }
  }, [progressMs, settings.targetDurationMs]);

  useEffect(() => {
    if (completedSessions === 3) {
      const celebrationTimeout = window.setTimeout(() => {
        setCompletedSessions(0);
      }, 2400);

      return () => window.clearTimeout(celebrationTimeout);
    }
    return undefined;
  }, [completedSessions]);

  const handleUpdateSettings = useCallback((next: HummingSettings) => {
    setSettings(next);
  }, []);

  const handleRecordReference = useCallback(async () => {
    try {
      if (isListening) {
        stopListening();
      }
      setRecordingError(null);
      setRecordingReference(true);
      const profile = await recordHummingReference();
      setSettings((prev) => ({ ...prev, referenceProfile: profile }));
    } catch (error) {
      console.error('Reference recording failed', error);
      setRecordingError('Recording failed. Please check your microphone permissions and try again.');
    } finally {
      setRecordingReference(false);
    }
  }, [isListening, stopListening]);

  const handleClearReference = useCallback(() => {
    setSettings((prev) => ({ ...prev, referenceProfile: null }));
  }, []);

  const progress = useMemo(() => {
    if (!settings.targetDurationMs) {
      return 0;
    }
    return progressMs / settings.targetDurationMs;
  }, [progressMs, settings.targetDurationMs]);

  const celebrating = completedSessions === 3;

  return (
    <div className={`app-shell ${celebrating ? 'app-shell--celebrating' : ''}`}>
      <header className="top-bar">
        <h1 className="app-title">HUMM</h1>
        <button
          className="settings-button"
          aria-label="Settings"
          type="button"
          onClick={() => setSettingsOpen(true)}
        >
          <img src={gearIcon} alt="Settings" />
        </button>
      </header>

      <main className="play-space">
        <FloatingNotes active={isListening} />
        <div className={`mammoth ${celebrating ? 'mammoth--celebrate' : ''}`}>
          <img src={mammothImage} alt="Baby mammoth dancing" />
        </div>
      </main>

      <footer className="session-footer">
        <BananaRewards count={completedSessions} />
        <div className="mic-controls">
          <button
            type="button"
            className={`mic-button ${isListening ? 'mic-button--active' : ''}`}
            onClick={isListening ? stopListening : startListening}
          >
            {isListening ? 'Stop listening' : 'Start listening'}
          </button>
          <p className="status-message">
            {isListening
              ? 'Hum along to fill the bar!'
              : settings.referenceProfile
                ? 'Tap start and match your saved hum.'
                : 'Record a humming reference in settings for best results.'}
          </p>
          {listeningError ? <p className="status-message status-message--error">{listeningError}</p> : null}
        </div>
        <HummingProgress progress={progress} />
      </footer>

      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onUpdate={handleUpdateSettings}
        onRecordReference={handleRecordReference}
        onClearReference={handleClearReference}
        recordingReference={recordingReference}
        recordingError={recordingError}
      />
    </div>
  );
};

export default App;
