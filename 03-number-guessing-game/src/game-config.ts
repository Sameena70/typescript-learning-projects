import {
  DifficultyLevel,
  DifficultyConfig,
  StandardDifficulty,
  CustomDifficultyConfig
} from './types.js';

export const DEFAULT_DIFFICULTIES: Record<StandardDifficulty, DifficultyConfig> = {
  easy: { name: 'Easy', min: 1, max: 100, maxAttempts: 7 },
  medium: { name: 'Medium', min: 1, max: 500, maxAttempts: 9 },
  hard: { name: 'Hard', min: 1, max: 1000, maxAttempts: 10 }
};

export class GameConfigManager {
  private customConfig: CustomDifficultyConfig = {
    name: 'Custom',
    difficulty: 'custom',
    min: 1,
    max: 200,
    maxAttempts: 8
  };

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
    if (min < 1) {
      throw new Error('Minimum value must be at least 1.');
    }
    if (max > 100000) {
      throw new Error('Maximum range cannot exceed 100,000.');
    }
    if (maxAttempts < 1 || maxAttempts > 50) {
      throw new Error('Attempts must be between 1 and 50.');
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
