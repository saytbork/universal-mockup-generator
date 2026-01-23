import React from 'react';
import { CREATIVE_MODES, getAllCreativeModes } from '@/lib/creativity';
import type { CreativeMode } from '@/lib/creativity';

interface CreativitySelectorProps {
    value: CreativeMode;
    onChange: (mode: CreativeMode) => void;
}

const MODE_ICONS: Record<CreativeMode, string> = {
    high_end_studio: '✨',
    vibrant_brand_explosion: '🎨',
    minimal_editorial: '◻️',
    natural_organic: '🌿',
    scientific_clean: '🔬',
    lifestyle_cinematic: '🎬',
    playful_bold: '🎯'
};

export function CreativitySelector({ value, onChange }: CreativitySelectorProps) {
    const modes = getAllCreativeModes();

    return (
        <div className="creativity-selector">
            <div className="creativity-header">
                <h2 className="creativity-title">Art Direction</h2>
                <span className="creativity-subtitle">This is the creative brain.</span>
            </div>

            <div className="creativity-grid">
                {modes.map(mode => {
                    const isActive = mode.id === value;
                    const config = CREATIVE_MODES[mode.id];

                    return (
                        <button
                            key={mode.id}
                            className={`creativity-card ${isActive ? 'active' : ''}`}
                            onClick={() => onChange(mode.id)}
                            type="button"
                        >
                            <span className="creativity-icon">{MODE_ICONS[mode.id]}</span>
                            <span className="creativity-name">{mode.name}</span>
                            <span className="creativity-desc">{config.brand.primarySignal}</span>
                        </button>
                    );
                })}
            </div>

            <style>{`
        .creativity-selector {
          margin-bottom: 24px;
        }
        .creativity-header {
          margin-bottom: 16px;
        }
        .creativity-title {
          font-size: 20px;
          font-weight: 700;
          color: #fff;
          margin: 0;
        }
        .creativity-subtitle {
          font-size: 14px;
          color: #a0a0a0;
        }
        .creativity-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 12px;
        }
        .creativity-card {
          background: rgba(255,255,255,0.05);
          border: 2px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 16px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .creativity-card:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.2);
        }
        .creativity-card.active {
          background: rgba(99,102,241,0.2);
          border-color: #6366f1;
        }
        .creativity-icon {
          display: block;
          font-size: 28px;
          margin-bottom: 8px;
        }
        .creativity-name {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 4px;
        }
        .creativity-desc {
          display: block;
          font-size: 11px;
          color: #888;
          text-transform: capitalize;
        }
      `}</style>
        </div>
    );
}

export default CreativitySelector;
