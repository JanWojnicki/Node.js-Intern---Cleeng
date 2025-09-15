import { Express } from 'express';
import { getPreferences, savePreferences } from '../store';
import { PreferencesSchema } from '../types';
import { ZodError } from 'zod';

export const preferencesControllerFactory = (app: Express) => {
	app.get('/preferences/:userId', (req, res) => {
		const { userId } = req.params;
		const preferences = getPreferences(userId);

		if (!preferences) {
			return res.status(404).send({ message: `Preferences for user ${userId} not found.` });
		}

		res.status(200).json(preferences);
	});

	app.post('/preferences/:userId', (req, res) => {
		const { userId } = req.params;

		try {
			// Validate the request body against the schema
			const preferences = PreferencesSchema.parse(req.body);
			savePreferences(userId, preferences);
			console.log(`Preferences for user ${userId} updated`, preferences);
			res.status(200).send({ message: 'Preferences updated successfully.' });
		} catch (error) {
			if (error instanceof ZodError) {
				return res.status(400).send({ message: 'Invalid preferences format.', errors: error.issues });
			}
			res.status(500).send({ message: 'An unexpected error occurred.' });
		}
	});
};

