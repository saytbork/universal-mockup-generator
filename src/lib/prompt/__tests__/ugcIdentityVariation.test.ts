import { afterEach, describe, expect, it, vi } from 'vitest';
import { mapLifestyleToPromptOptions } from '../../promptEngine/mapLifestyleToPromptOptions';

const makeUgcState = () =>
  ({
    sceneType: 'lifestyle-real',
    visualMode: 'ugc',
    visualIntent: 'ugc',
    contentStyle: 'ugc',
    creationIntent: 'ugc',
    creationMode: 'Lifestyle UGC',
    noPerson: false,
    personIncluded: true,
    personCount: 'single',
    age: 30,
    gender: 'Female',
    skinTone: 'Medium Neutral',
    ethnicity: 'Non-specific',
    bodyType: 'Average',
    hairState: 'natural',
    hairLength: 'Shoulder',
    hairTexture: 'Wavy',
    hairColor: 'Dark brown',
    eyeColor: 'Brown',
    facialExpression: 'Soft Smile',
    eyeDirection: 'Looking at camera',
    appearanceLevel: 'Regular',
    pose: 'Relaxed Portrait',
    skinRealism: 'Raw / Real',
    environmentContext: { macro: 'none', micro: '' },
    environment: 'none',
    customEnvironment: '',
    timeOfDay: 'Afternoon',
    lightingStyle: 'Natural',
    shotType: 'Medium',
    cameraType: 'DSLR / mirrorless camera',
    cameraAngle: 'Eye level',
    framing: 'Rule of thirds',
    productProminence: 'product-first',
    productInteraction: 'Holding',
    productUsageDescription: '',
    ugcRealMode: true,
    ugcImperfectionLevel: 'high',
    ugcCaptureStyleBase: ['torso-level-handheld'],
    ugcCameraOperator: [],
    ugcBodyPhonePosition: [],
    ugcMotionStability: [],
    ugcFramingImperfections: [],
    ugcAwkwardContext: [],
    sameCreatorAcrossScenes: false,
    selfieMode: 'None',
    aspectRatio: '1:1 (Square)',
    seed: '',
  }) as any;

describe('UGC identity variation', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('varies default ugc creator cues between renders when same creator is off', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.1234);
    vi.spyOn(Date, 'now').mockReturnValue(1000);
    const first = mapLifestyleToPromptOptions(makeUgcState(), {}, false) as any;

    vi.spyOn(Date, 'now').mockReturnValue(2000);
    const second = mapLifestyleToPromptOptions(makeUgcState(), {}, false) as any;

    expect(randomSpy).toHaveBeenCalled();
    expect(first.identityVariationToken).not.toBe(second.identityVariationToken);

    const firstSignature = [
      first.personDetails?.facialExpression,
      first.personDetails?.eyeDirection,
      first.personDetails?.personPose,
      first.personDetails?.personAppearance,
    ].join('|');

    const secondSignature = [
      second.personDetails?.facialExpression,
      second.personDetails?.eyeDirection,
      second.personDetails?.personPose,
      second.personDetails?.personAppearance,
    ].join('|');

    expect(firstSignature).not.toBe(secondSignature);
  });

  it('preserves explicit manual creator choices in ugc mode', () => {
    const state = makeUgcState();
    state.facialExpression = 'Joyful & High-Energy';
    state.eyeDirection = 'Looking at product';
    state.pose = 'Leaned-In Close';
    state.appearanceLevel = 'Running Late';

    const mapped = mapLifestyleToPromptOptions(state, {}, false) as any;

    expect(mapped.personDetails?.facialExpression).toContain('joyful');
    expect(mapped.personDetails?.eyeDirection).toContain('product');
    expect(mapped.personDetails?.personPose).toContain('leaning forward');
    expect(mapped.personDetails?.personAppearance).toContain('running-late');
  });

  it('forces front-facing flat-focus smartphone camera for ugc even when ui still carries pro camera selection', () => {
    const mapped = mapLifestyleToPromptOptions(makeUgcState(), {}, false) as any;

    expect(mapped.camera).toBe('Front-facing smartphone camera with tiny sensor limitations');
    expect(mapped.cameraDeviceSemantic).toContain('Front-facing phone camera only');
    expect(mapped.cameraDeviceSemantic).toContain('Single-plane casual capture');
    expect(mapped.cameraDeviceSemantic).toContain('No deep depth-of-field');
    expect(mapped.cameraDeviceSemantic).not.toContain('DSLR');
    expect(mapped.cameraDeviceSemantic).not.toContain('mirrorless');
    expect(mapped.cameraDeviceSemantic).not.toContain('premium glass');
  });
});
