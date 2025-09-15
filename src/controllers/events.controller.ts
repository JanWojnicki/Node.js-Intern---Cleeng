import { Express } from 'express';
import { getPreferences } from '../store';
import { EventSchema } from '../types';
import { ZodError } from 'zod';

/**
 * Checks if a given timestamp falls within a "Do Not Disturb" window.
 * @param timestamp The ISO 8601 timestamp of the event.
 * @param dnd The DND object with start and end times in 'HH:MM' format.
 * @returns True if the time is within the DND window, false otherwise.
 */
export const isWithinDnd = (timestamp: string, dnd: { start: string; end: string }): boolean => {
    const eventDate = new Date(timestamp);
    // Get time in 'HH:MM' format from the event's timestamp (in UTC)
    const eventTime = eventDate.toISOString().substring(11, 16);

    const { start, end } = dnd;

    // Case 1: DND window does not cross midnight (e.g., 09:00 to 17:00)
    if (start < end) {
        return eventTime >= start && eventTime < end;
    }
    
    // Case 2: DND window crosses midnight (e.g., 22:00 to 07:00)
    // The DND period is from the start time to midnight OR from midnight to the end time.
    return eventTime >= start || eventTime < end;
};


export const eventsControllerFactory = (app: Express) => {
	app.post('/events', (req, res) => {
		try {
            const event = EventSchema.parse(req.body);
            const { userId, eventType, timestamp } = event;

            const preferences = getPreferences(userId);

            if (!preferences) {
                // If no preferences are set for a user, we assume they want notifications.
                // This behavior can be changed to DO_NOT_NOTIFY if explicit consent is required.
                console.log(`No preferences found for user ${userId}, allowing notification by default.`);
                return res.status(202).send({ decision: 'PROCESS_NOTIFICATION' });
            }

            // Check 1: User subscription for this event type
            const eventSetting = preferences.eventSettings[eventType];
            if (eventSetting && !eventSetting.enabled) {
                return res.status(200).send({
                    decision: 'DO_NOT_NOTIFY',
                    reason: 'USER_UNSUBSCRIBED_FROM_EVENT',
                });
            }

            // Check 2: "Do Not Disturb" window
            if (isWithinDnd(timestamp, preferences.dnd)) {
                return res.status(200).send({
                    decision: 'DO_NOT_NOTIFY',
                    reason: 'DND_ACTIVE',
                });
            }

            // If all checks pass, the notification should be processed
            res.status(202).send({ decision: 'PROCESS_NOTIFICATION' });

        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).send({ message: 'Invalid event format.', errors: error.issues });
			}
			console.error('Error processing event:', error);
			res.status(500).send({ message: 'An unexpected error occurred.' });
        }
	});
};
