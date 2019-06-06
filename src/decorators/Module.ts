import { BaseModule } from '../lib/BaseModule';

const moduleConfig: Symbol = Symbol('@streamjar/hapi-decorators:module');

export interface IModuleConfig {
	basePath: string;
}

export function getModuleConfig(module: typeof BaseModule): IModuleConfig | null {
	if (!Reflect.hasMetadata(moduleConfig, module)) {
		return null;
	}

	return Reflect.getMetadata(moduleConfig, module);
}

export function ModuleDecorator(config: IModuleConfig): Function {
	return (target: any): void => {
		Reflect.defineMetadata(moduleConfig, config, target);
	};
}
