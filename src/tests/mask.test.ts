import { describe, expect, it } from 'vitest';
import { maskActivationKey } from '../utils/mask';

describe('maskActivationKey', () => {
    it('masks all but the first two segments of a dashed key', () => {
        const result = maskActivationKey('ABCD-1234-EFGH-IJKL');
        expect(result).toBe('ABCD-1234-****-****');
    });

    it('returns masked string for invalid format', () => {
        const result = maskActivationKey('short');
        expect(result).toBe('****');
    });
});
