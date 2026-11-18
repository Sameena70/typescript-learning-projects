import {
  DifficultyLevel,
  DifficultyConfig,
  StandardDifficulty,
  CustomDifficultyConfig
} from './types.js';

/**
 * Standard game boundaries and attempt limits.
 */
export const MIN_POSSIBLE_VALUE = 1;
export const MAX_POSSIBLE_VALUE = 100000;
export const MIN_ATTEMPTS = 1;
export const MAX_ATTEMPTS = 50;

/**
 * Standard preset difficulty configurations.
 */
export const DEFAULT_DIFFICULTIES: Record<StandardDifficulty, DifficultyConfig> = {
  easy: { name: 'Easy', min: 1, max: 50, maxAttempts: 10 },
  medium: { name: 'Medium', min: 1, max: 100, maxAttempts: 10 },
  hard: { name: 'Hard', min: 1, max: 1000, maxAttempts: 10 }
};

/**
 * Default custom configuration fallback.
 */
export const DEFAULT_CUSTOM_CONFIG: CustomDifficultyConfig = {
  name: 'Custom',
  difficulty: 'custom',
  min: 1,
  max: 200,
  maxAttempts: 8
};

/**
 * Manages standard difficulty presets and custom user configuration boundaries.
 */
export class GameConfigManager {
  private customConfig: CustomDifficultyConfig;

  constructor(initialCustomConfig: CustomDifficultyConfig = { ...DEFAULT_CUSTOM_CONFIG }) {
    this.customConfig = { ...initialCustomConfig };
  }

  public getConfig(difficulty: DifficultyLevel): DifficultyConfig {
    if (difficulty === 'custom') {
      return { ...this.customConfig };
    }
    return DEFAULT_DIFFICULTIES[difficulty];
  }

  public setCustomConfig(min: number, max: number, maxAttempts: number): void {
    if (typeof min !== 'number' || typeof max !== 'number' || typeof maxAttempts !== 'number') {
      throw new Error('All configuration parameters must be numbers.');
    }
    if (min >= max) {
      throw new Error('Minimum value must be less than maximum value.');
    }
    if (min < MIN_POSSIBLE_VALUE) {
      throw new Error(`Minimum value must be at least ${MIN_POSSIBLE_VALUE}.`);
    }
    if (max > MAX_POSSIBLE_VALUE) {
      throw new Error(`Maximum range cannot exceed ${MAX_POSSIBLE_VALUE.toLocaleString()}.`);
    }
    if (maxAttempts < MIN_ATTEMPTS || maxAttempts > MAX_ATTEMPTS) {
      throw new Error(`Attempts must be between ${MIN_ATTEMPTS} and ${MAX_ATTEMPTS}.`);
    }

    this.customConfig = {
      name: 'Custom',
      difficulty: 'custom',
      min: Math.floor(min),
      max: Math.floor(max),
      maxAttempts: Math.floor(maxAttempts)
    };
  }

  public getCustomConfig(): Readonly<CustomDifficultyConfig> {
    return { ...this.customConfig };
  }
}
