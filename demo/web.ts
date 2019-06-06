import { Server } from '@hapi/hapi';
import { join } from 'path';

import { App, IApp, Modules } from '../src';

@App({
	config: {
		host: '127.0.0.1',
		port: 3000,
		routes: {
			cors: true,
		},
	},
})
@Modules([join(__dirname, 'routes')])
export class ServerApp implements IApp {
	public readonly server: Server;

	public constructor(server: Server) {
		this.server = server;
	}

	public onInit(): void {
		// tslint:disable-next-line
		console.log('OnInit() called');
	}

	public onRegister(): void {
		// tslint:disable-next-line
		console.log('onRegister() called');
	}

	public onStart(): void {
		// tslint:disable-next-line
		console.log('onStart() called');
	}
}
