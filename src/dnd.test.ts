import { isWithinDnd } from './controllers/events.controller';

describe('isWithinDnd', () => {

    // Test Suite 1: DND window does NOT cross midnight (e.g., 09:00 to 17:00)
    describe('when DND window does not cross midnight', () => {
        const dnd = { start: '09:00', end: '17:00' };

        it('should return false for a time before the DND window', () => {
            const timestamp = '2025-09-13T08:59:00Z'; // 08:59 UTC
            expect(isWithinDnd(timestamp, dnd)).toBe(false);
        });

        it('should return true for a time at the start of the DND window', () => {
            const timestamp = '2025-09-13T09:00:00Z'; // 09:00 UTC
            expect(isWithinDnd(timestamp, dnd)).toBe(true);
        });

        it('should return true for a time within the DND window', () => {
            const timestamp = '2025-09-13T12:30:00Z'; // 12:30 UTC
            expect(isWithinDnd(timestamp, dnd)).toBe(true);
        });

        it('should return false for a time at the end of the DND window', () => {
            // "end" is exclusive, so 17:00 should not be blocked
            const timestamp = '2025-09-13T17:00:00Z'; // 17:00 UTC
            expect(isWithinDnd(timestamp, dnd)).toBe(false);
        });

        it('should return false for a time after the DND window', () => {
            const timestamp = '2025-09-13T17:01:00Z'; // 17:01 UTC
            expect(isWithinDnd(timestamp, dnd)).toBe(false);
        });
    });

    // Test Suite 2: DND window DOES cross midnight (e.g., 22:00 to 07:00)
    describe('when DND window crosses midnight', () => {
        const dnd = { start: '22:00', end: '07:00' };

        it('should return false for a time before the DND window starts', () => {
            const timestamp = '2025-09-13T21:59:00Z'; // 21:59 UTC
            expect(isWithinDnd(timestamp, dnd)).toBe(false);
        });

        it('should return true for a time in the evening part of the window', () => {
            const timestamp = '2025-09-13T23:30:00Z'; // 23:30 UTC
            expect(isWithinDnd(timestamp, dnd)).toBe(true);
        });

        it('should return true for a time just after midnight', () => {
            const timestamp = '2025-09-14T00:01:00Z'; // Next day, 00:01 UTC
            expect(isWithinDnd(timestamp, dnd)).toBe(true);
        });

        it('should return true for a time in the morning part of the window', () => {
            const timestamp = '2025-09-14T06:59:00Z'; // Next day, 06:59 UTC
            expect(isWithinDnd(timestamp, dnd)).toBe(true);
        });

        it('should return false for a time exactly at the end of the DND window', () => {
             // "end" is exclusive, so 07:00 should not be blocked
            const timestamp = '2025-09-14T07:00:00Z'; // Next day, 07:00 UTC
            expect(isWithinDnd(timestamp, dnd)).toBe(false);
        });

        it('should return false for a time after the DND window ends', () => {
            const timestamp = '2025-09-14T08:00:00Z'; // Next day, 08:00 UTC
            expect(isWithinDnd(timestamp, dnd)).toBe(false);
        });
    });
});
