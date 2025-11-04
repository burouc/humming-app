import { ChangeEvent, useMemo } from 'react';
import type { HummingSettings } from '../types';

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  settings: HummingSettings;
  onUpdate: (settings: HummingSettings) => void;
  onRecordReference: () => Promise<void>;
  onClearReference: () => void;
  recordingReference: boolean;
  recordingError: string | null;
}

export const SettingsPanel = ({
  open,
  onClose,
  settings,
  onUpdate,
  onRecordReference,
  onClearReference,
  recordingReference,
  recordingError
}: SettingsPanelProps) => {
  const targetSeconds = useMemo(() => Math.round(settings.targetDurationMs / 1000), [settings.targetDurationMs]);

  if (!open) {
    return null;
  }

  const handleDurationChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    if (!Number.isFinite(value) || Number.isNaN(value)) {
      return;
    }
    const nextDuration = Math.max(3, Math.min(120, value));
    onUpdate({
      ...settings,
      targetDurationMs: Math.round(nextDuration * 1000)
    });
  };

  const handleRecord = async () => {
    await onRecordReference();
  };

  return (
    <div className="settings-overlay" role="dialog" aria-modal="true">
      <div className="settings-panel">
        <header className="settings-panel__header">
          <h2>Settings</h2>
          <button type="button" className="settings-panel__close" onClick={onClose} aria-label="Close settings">
            ×
          </button>
        </header>

        <section className="settings-panel__section">
          <label className="settings-panel__label" htmlFor="target-duration">
            Seconds of humming for a banana
          </label>
          <input
            id="target-duration"
            type="number"
            min={3}
            max={120}
            step={1}
            value={targetSeconds}
            onChange={handleDurationChange}
            className="settings-panel__input"
          />
        </section>

        <section className="settings-panel__section">
          <h3 className="settings-panel__subheading">Reference humming</h3>
          {settings.referenceProfile ? (
            <p className="settings-panel__info">
              Saved profile • Intensity {(settings.referenceProfile.rms || 0).toFixed(2)}
              {settings.referenceProfile.frequency
                ? ` • Pitch ${Math.round(settings.referenceProfile.frequency)} Hz`
                : ' • Pitch unavailable'}
            </p>
          ) : (
            <p className="settings-panel__info">No humming reference saved yet.</p>
          )}

          <div className="settings-panel__actions">
            <button
              type="button"
              className="settings-panel__button"
              onClick={handleRecord}
              disabled={recordingReference}
            >
              {recordingReference ? 'Listening…' : 'Record reference'}
            </button>
            {settings.referenceProfile ? (
              <button type="button" className="settings-panel__button settings-panel__button--secondary" onClick={onClearReference}>
                Clear reference
              </button>
            ) : null}
          </div>
          {recordingError ? <p className="settings-panel__error">{recordingError}</p> : null}
          <p className="settings-panel__hint">Hum your happiest note during the recording window.</p>
        </section>
      </div>
    </div>
  );
};
