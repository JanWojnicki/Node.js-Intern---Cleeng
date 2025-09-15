import express from 'express';
import { eventsControllerFactory } from './controllers/events.controller';
import { preferencesControllerFactory } from './controllers/preferences.controller';

const main = () => {
	const app = express();
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));

	const port = Number.parseFloat(process.env.PORT ?? '3000');
	eventsControllerFactory(app);
	preferencesControllerFactory(app);

	app.listen(port, () => {
		console.log(`Server is running on http://localhost:${port}`);
	});
};

main();
