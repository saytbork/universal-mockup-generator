import React, { useState } from 'react';
import type { ProductStudioState } from '@/lib/product';
import { DEFAULT_PRODUCT_STUDIO_STATE, PRODUCT_STUDIO_ENVIRONMENTS, mapProductStudioToPrompt } from '@/lib/product';
import { CreativitySelector } from './CreativitySelector';
import { CompositionSelector } from './CompositionSelector';
import { SidePlacementSelector } from './SidePlacementSelector';
import type { CreativeMode } from '@/lib/creativity';
import type { CommercialComposition } from '@/lib/system';
import type { SidePlacement, AspectRatio } from '@/lib/composition';

interface ProductStudioPanelProps {
    productDescription: string;
    onPromptGenerated?: (prompt: string, negative: string) => void;
}

export function ProductStudioPanel({ productDescription, onPromptGenerated }: ProductStudioPanelProps) {
    const [state, setState] = useState<ProductStudioState>(DEFAULT_PRODUCT_STUDIO_STATE);

    const updateState = <K extends keyof ProductStudioState>(key: K, value: ProductStudioState[K]) => {
        setState(prev => {
            const next = { ...prev, [key]: value };
            const result = mapProductStudioToPrompt(next, productDescription);
            if (onPromptGenerated) {
                onPromptGenerated(result.prompt, result.negativePrompt);
            }
            return next;
        });
    };

    return (
        <div className="product-studio-panel">
            {/* HEADER */}
            <div className="studio-header">
                <h1 className="studio-title">Product Studio</h1>
                <p className="studio-subtitle">System-led commercial imagery. Maximum control. Zero guesswork.</p>
                <div className="studio-authority">System decisions override incompatible choices.</div>
            </div>

            {/* Block 1: Art Direction (DOMINANT) */}
            <CreativitySelector
                value={state.creativeMode}
                onChange={(mode: CreativeMode) => updateState('creativeMode', mode)}
            />

            {/* Block 2: Commercial Composition */}
            <CompositionSelector
                value={state.commercialComposition}
                onChange={(comp: CommercialComposition) => updateState('commercialComposition', comp)}
            />

            {/* Block 3: Side Placement (BEFORE Environment) */}
            <div className="studio-block">
                <h3>Side Placement</h3>
                <span className="block-hint">Used for ecommerce layouts with text overlays.</span>
                <SidePlacementSelector
                    value={state.sidePlacement}
                    onChange={(p: SidePlacement) => updateState('sidePlacement', p)}
                    aspectRatio={state.aspectRatio}
                />
            </div>

            {/* Block 4: Aspect Ratio (STRUCTURAL, not output) */}
            <div className="studio-block">
                <h3>Aspect Ratio</h3>
                <span className="block-hint">Defines the structure of the image, not just the crop.</span>
                <div className="aspect-options">
                    {(['1:1', '4:5', '9:16'] as AspectRatio[]).map(ratio => (
                        <button
                            key={ratio}
                            className={`aspect-btn ${state.aspectRatio === ratio ? 'active' : ''}`}
                            onClick={() => updateState('aspectRatio', ratio)}
                            type="button"
                        >
                            {ratio}
                        </button>
                    ))}
                </div>
            </div>

            {/* Block 5: Environment */}
            <div className="studio-block">
                <h3>Environment</h3>
                <div className="env-options">
                    {PRODUCT_STUDIO_ENVIRONMENTS.map(env => (
                        <button
                            key={env.id}
                            className={`env-btn ${state.environment === env.id ? 'active' : ''}`}
                            onClick={() => updateState('environment', env.id as ProductStudioState['environment'])}
                            type="button"
                        >
                            {env.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Block 6: Lighting */}
            <div className="studio-block">
                <h3>Lighting</h3>
                <span className="block-hint">Some conditions are physically impossible. We correct them automatically.</span>
                <select
                    value={state.lightingStyle}
                    onChange={e => updateState('lightingStyle', e.target.value as ProductStudioState['lightingStyle'])}
                    className="studio-select"
                >
                    <option value="natural_light">Natural Light</option>
                    <option value="sunny_day">Sunny Day</option>
                    <option value="overcast">Overcast</option>
                    <option value="golden_hour">Golden Hour</option>
                    <option value="mood_lighting">Mood Lighting</option>
                </select>
            </div>

            {/* Block 7: Camera */}
            <div className="studio-block">
                <h3>Camera</h3>
                <div className="camera-row">
                    <label>Shot Type</label>
                    <select
                        value={state.cameraShot}
                        onChange={e => updateState('cameraShot', e.target.value as ProductStudioState['cameraShot'])}
                        className="studio-select"
                    >
                        <option value="close_up">Close Up</option>
                        <option value="portrait">Portrait</option>
                        <option value="medium">Medium Shot</option>
                    </select>
                </div>
                <div className="camera-row">
                    <label>Angle</label>
                    <select
                        value={state.cameraAngle}
                        onChange={e => updateState('cameraAngle', e.target.value as ProductStudioState['cameraAngle'])}
                        className="studio-select"
                    >
                        <option value="eye_level">Eye Level</option>
                        <option value="slight_high">Slight High</option>
                        <option value="slight_low">Slight Low</option>
                        <option value="top_down">Top Down</option>
                    </select>
                </div>
            </div>

            {/* Block 8: Output */}
            <div className="studio-block">
                <h3>Output Format</h3>
                <div className="output-info">Final image will be rendered at {state.aspectRatio}</div>
            </div>

            <style>{`
        .product-studio-panel {
          padding: 20px;
        }
        .studio-header {
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .studio-title {
          font-size: 24px;
          font-weight: 700;
          color: #fff;
          margin: 0 0 4px 0;
        }
        .studio-subtitle {
          font-size: 14px;
          color: #a0a0a0;
          margin: 0 0 12px 0;
        }
        .studio-authority {
          font-size: 11px;
          color: #6366f1;
          background: rgba(99,102,241,0.1);
          padding: 6px 10px;
          border-radius: 4px;
          display: inline-block;
        }
        .studio-block {
          margin-bottom: 20px;
        }
        .studio-block h3 {
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          margin: 0 0 4px 0;
        }
        .block-hint {
          display: block;
          font-size: 11px;
          color: #888;
          margin-bottom: 10px;
        }
        .env-options, .aspect-options {
          display: flex;
          gap: 8px;
        }
        .env-btn, .aspect-btn {
          flex: 1;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px;
          padding: 10px;
          color: #fff;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s;
        }
        .env-btn:hover, .aspect-btn:hover {
          background: rgba(255,255,255,0.1);
        }
        .env-btn.active, .aspect-btn.active {
          background: rgba(99,102,241,0.2);
          border-color: #6366f1;
        }
        .studio-select {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px;
          padding: 10px;
          color: #fff;
          font-size: 13px;
        }
        .camera-row {
          margin-bottom: 12px;
        }
        .camera-row label {
          display: block;
          font-size: 12px;
          color: #888;
          margin-bottom: 6px;
        }
        .output-info {
          font-size: 13px;
          color: #888;
        }
      `}</style>
        </div>
    );
}

export default ProductStudioPanel;
