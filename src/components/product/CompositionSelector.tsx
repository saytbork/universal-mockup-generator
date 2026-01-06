import React from 'react';
import { getCompositionOptions } from '@/lib/system';
import type { CommercialComposition } from '@/lib/system';

interface CompositionSelectorProps {
    value: CommercialComposition;
    onChange: (composition: CommercialComposition) => void;
}

const COMPOSITION_ICONS: Record<CommercialComposition, string> = {
    hero_product: '🎯',
    duo_offer: '🤝',
    routine_system: '📋'
};

export function CompositionSelector({ value, onChange }: CompositionSelectorProps) {
    const options = getCompositionOptions();

    return (
        <div className="composition-selector">
            <div className="composition-header">
                <h3 className="composition-title">Commercial Composition</h3>
                <span className="composition-subtitle">How your products tell a story.</span>
            </div>

            <div className="composition-options">
                {options.map(opt => {
                    const isActive = opt.id === value;

                    return (
                        <button
                            key={opt.id}
                            className={`composition-card ${isActive ? 'active' : ''}`}
                            onClick={() => onChange(opt.id)}
                            type="button"
                        >
                            <span className="composition-icon">{COMPOSITION_ICONS[opt.id]}</span>
                            <div className="composition-text">
                                <span className="composition-name">{opt.title}</span>
                                <span className="composition-desc">{opt.description}</span>
                            </div>
                        </button>
                    );
                })}
            </div>

            <style>{`
        .composition-selector {
          margin-bottom: 20px;
        }
        .composition-header {
          margin-bottom: 12px;
        }
        .composition-title {
          font-size: 16px;
          font-weight: 600;
          color: #fff;
          margin: 0;
        }
        .composition-subtitle {
          font-size: 12px;
          color: #888;
        }
        .composition-options {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .composition-card {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }
        .composition-card:hover {
          background: rgba(255,255,255,0.08);
        }
        .composition-card.active {
          background: rgba(99,102,241,0.15);
          border-color: #6366f1;
        }
        .composition-icon {
          font-size: 24px;
        }
        .composition-text {
          flex: 1;
        }
        .composition-name {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #fff;
        }
        .composition-desc {
          display: block;
          font-size: 12px;
          color: #888;
        }
      `}</style>
        </div>
    );
}

export default CompositionSelector;
