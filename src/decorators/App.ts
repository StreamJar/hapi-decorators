import { Server, ServerExtEventsObject, ServerExtEventsRequestObject, ServerOptions, ServerRegisterPluginObject } from '@hapi/hapi';
import 'reflect-metadata';

const appConfig: Symbol = Symbol('@streamjar/hapi-decorators:app-config');

export type IAppPlugins = ServerRegisterPluginObject<any>;
export type IAppExtensions =
	(ServerExtEventsObject | ServerExtEventsObject[] | ServerExtEventsRequestObject | ServerExtEventsRequestObject[]);

export interface IAppConfig {
	config: ServerOptions;
	plugins?: IAppPlugins[];
	extensions?: IAppExtensions[];
}

export interface IApp {
	server: Server;

	onInit?(): void;
	onRegister?(): void;
	onStart?(): void;
}

export type IAppStatic = new(server: Server) => IApp;

/**
 * Fetch application metadata
 *
 * @param app Application class to bootstrap
 */
export function getAppMetadata(app: IAppStatic): IAppConfig | null {
	if (!Reflect.hasMetadata(appConfig, app)) {
		return null;
	}

	return Reflect.getMetadata(appConfig, app);
}

/**
 * Declare a new app
 *
 * @param config hapi configuration
 */
export function AppDecorator(config: IAppConfig): Function {
	return (target: any): void => {
		Reflect.defineMetadata(appConfig, config, target);
	};
}
