import { Server, ServerOptions, ServerRoute } from '@hapi/hapi';

import { getAppMetadata, IApp, IAppConfig, IAppExtensions, IAppPlugins, IAppStatic } from '../decorators/App';
import { loadModules } from '../decorators/Modules';
import { BaseModule } from './BaseModule';
import { loadRoutes } from './loadRoutes';

const DEFAULT_APP_CONFIG: Partial<ServerOptions> = {
	host: '127.0.0.1',
	port: 3000,
};

/**
 * Bootstrap an instance of hapi.
 *
 * @param App Application Class
 */
export async function bootstrap(App: IAppStatic): Promise<IApp> { // tslint:disable-line
	const meta: IAppConfig | null = getAppMetadata(App);

	if (!meta) {
		throw new Error('Module lacks the @App decorator');
	}

	// Create a new hapi server
	const server: Server = new Server({ ...DEFAULT_APP_CONFIG, ...meta.config });
	const serverApp: IApp = new App(server);

	// Init hook
	if (serverApp.onInit) {
		serverApp.onInit();
	}

	// Load all the routes, ready for loading
	const modules: typeof BaseModule[] = await loadModules(App);
	const routes: ServerRoute[][] = modules.map(loadRoutes);

	// Register any plugins that exist.
	await Promise.all((meta.plugins || []).map((plugin: IAppPlugins) => server.register(plugin)));

	// Register hook
	if (serverApp.onRegister) {
		serverApp.onRegister();
	}

	// Load any extensions
	(meta.extensions || []).map((ext: IAppExtensions) => {
		server.ext(ext);
	});

	// Register all the routes
	for (const route of routes) {
		server.route(route);
		console.log((<any>route)[0]!.options!.validate!, route[0].method, route[0].path);
	}

	// Boot hapi
	await server.start();

	// Call start hook
	if (serverApp.onStart) {
		serverApp.onStart();
	}

	return serverApp;
}
