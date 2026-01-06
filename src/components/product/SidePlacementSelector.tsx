import React from 'react';
import type { SidePlacement } from '@/lib/composition';

interface SidePlacementSelectorProps {
    value: SidePlacement;
    onChange: (placement: SidePlacement) => void;
    aspectRatio: '1:1' | '4:5' | '9:16' | '16:9';
}

export function SidePlacementSelector({ value, onChange, aspectRatio }: SidePlacementSelectorProps) {
    // 1:1 only allows center
    const isRestricted = aspectRatio === '1:1';

    const options: { id: SidePlacement; label: string; icon: string }[] = [
        { id: 'left', label: 'Left', icon: '◀' },
        { id: 'center', label: 'Center', icon: '⬤' },
        { id: 'right', label: 'Right', icon: '▶' }
    ];

    return (
        <div className="placement-selector">
            <div className="placement-header">
                <h4 className="placement-title">Side Placement</h4>
                {isRestricted && (
                    <span className="placement-warning">
                        1:1 requires center placement
                    </span>
                )}
            </div>

            <div className="placement-options">
                {options.map(opt => {
                    const isActive = opt.id === value;
                    const isDisabled = isRestricted && opt.id !== 'center';

                    return (
                        <button
                            key={opt.id}
                            className={`placement-btn ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
                            onClick={() => !isDisabled && onChange(opt.id)}
                            disabled={isDisabled}
                            type="button"
                            title={isDisabled ? '1:1 aspect ratio requires center placement' : opt.label}
                        >
                            <span className="placement-icon">{opt.icon}</span>
                            <span className="placement-label">{opt.label}</span>
                        </button>
                    );
                })}
            </div>

            {value !== 'center' && !isRestricted && (
                <div className="placement-info">
                    Subject anchored to the {value} third. Center forbidden.
                </div>
            )}

            <style>{`
        .placement-selector {
          margin-bottom: 16px;
        }
        .placement-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        .placement-title {
          font-size: 14px;
          font-weight: 500;
          color: #fff;
          margin: 0;
        }
        .placement-warning {
          font-size: 11px;
          color: #f59e0b;
          background: rgba(245,158,11,0.15);
          padding: 2px 8px;
          border-radius: 4px;
        }
        .placement-options {
          display: flex;
          gap: 8px;
        }
        .placement-btn {
          flex: 1;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 12px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        .placement-btn:hover:not(.disabled) {
          background: rgba(255,255,255,0.1);
        }
        .placement-btn.active {
          background: rgba(99,102,241,0.2);
          border-color: #6366f1;
        }
        .placement-btn.disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .placement-icon {
          font-size: 18px;
          color: #fff;
        }
        .placement-label {
          font-size: 12px;
          color: #888;
        }
        .placement-info {
          margin-top: 8px;
          font-size: 11px;
          color: #6366f1;
          background: rgba(99,102,241,0.1);
          padding: 6px 10px;
          border-radius: 4px;
        }
      `}</style>
        </div>
    );
}

export default SidePlacementSelector;
