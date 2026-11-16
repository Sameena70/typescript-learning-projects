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
export const DEFAULT_DIFFICULTIES = {
    easy: { name: 'Easy', min: 1, max: 100, maxAttempts: 7 },
    medium: { name: 'Medium', min: 1, max: 500, maxAttempts: 9 },
    hard: { name: 'Hard', min: 1, max: 1000, maxAttempts: 10 }
};
/**
 * Default custom configuration fallback.
 */
export const DEFAULT_CUSTOM_CONFIG = {
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
    constructor(initialCustomConfig = Object.assign({}, DEFAULT_CUSTOM_CONFIG)) {
        this.customConfig = Object.assign({}, initialCustomConfig);
    }
    getConfig(difficulty) {
        if (difficulty === 'custom') {
            return Object.assign({}, this.customConfig);
        }
        return DEFAULT_DIFFICULTIES[difficulty];
    }
    setCustomConfig(min, max, maxAttempts) {
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
    getCustomConfig() {
        return Object.assign({}, this.customConfig);
    }
}
