import { bootstrap } from '../src';
import { ServerApp } from './web';

(async (): Promise<void> => {
	await bootstrap(ServerApp);
})().catch((err: Error) => {
	console.log(err); // tslint:disable-line
});
