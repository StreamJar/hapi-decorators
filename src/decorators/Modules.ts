import * as _ from 'lodash';
import 'reflect-metadata';

import { BaseModule } from '../lib/BaseModule';
import { loadModulesFromPath } from '../util/Structure';
import { IAppStatic } from './App';

const routesConfig: Symbol = Symbol('@streamjar/hapi-decorators:routes-config');

export type IModule = (string | typeof BaseModule);
export type IModulesConfig = IModule[];

/**
 * Fetch modules configuration
 *
 * @param app App to bootstrap
 */
function getModulesMetadata(app: IAppStatic): IModulesConfig | null {
	if (!Reflect.hasMetadata(routesConfig, app)) {
		return null;
	}

	return Reflect.getMetadata(routesConfig, app);
}

/**
 * Load all modules
 *
 * Modules can be loaded by path/directory or via reference. This loads
 * all of the modules so we have them all ready to go.
 *
 * @param app App to bootstrap
 */
export async function loadModules(app: IAppStatic): Promise<(typeof BaseModule)[]> {
	const metadata: IModulesConfig | null = getModulesMetadata(app);

	if (!metadata) {
		return [];
	}

	const modules: (typeof BaseModule)[] = <typeof BaseModule[]>metadata.filter((route: IModule) => route instanceof BaseModule);
	const paths: string[] = <string[]>metadata.filter((route: IModule) => !(route instanceof BaseModule));

	const discoveredModules: typeof BaseModule[][] = await Promise.all(paths.map(loadModulesFromPath));

	return modules.concat(...discoveredModules);
}

/**
 * Loads modules from a path or from a file.
 *
 * @param paths Path to file or directory _or_ a module itself.
 */
export function ModulesDecorator(paths: IModulesConfig): Function {
	return (target: any): void => {
		Reflect.defineMetadata(routesConfig, paths, target);
	};
}
