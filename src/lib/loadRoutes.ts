import { Request, RouteOptionsAccess, RouteOptionsValidate, ServerRoute, ValidationObject } from '@hapi/hapi';
import * as _ from 'lodash';
import { BaseModule } from './BaseModule';

import { getAuthConfig } from '../decorators/Auth';
import { getFeatureFlagConfig } from '../decorators/FeatureFlag';
import { getModuleConfig, IModuleConfig } from '../decorators/Module';
import { getRoutesConfig, IRouteConfig } from '../decorators/Route';
import { getValidationConfig } from '../decorators/Validation';

export function getFeatureFlagsFromRoute(request: Request): string[] {
	return (<any>request.route.settings.plugins).jarFeatureFlags || [];
}

// tslint:disable-next-line
export function loadRoutes(Module: typeof BaseModule): ServerRoute[] {
	const module: BaseModule = new Module();
	const routeHandlers: IRouteConfig[] = getRoutesConfig(Module);
	const routes: ServerRoute[] = [];

	// Fetch all configurations for the module
	const moduleCfg: IModuleConfig | null = getModuleConfig(Module);
	const moduleAuth: RouteOptionsAccess | null = getAuthConfig(Module);
	const moduleFeatureFlags: { flags: string[] } = getFeatureFlagConfig(Module);
	const moduleValidateConfig: RouteOptionsValidate = getValidationConfig(Module);

	routeHandlers.forEach((handler: IRouteConfig) => {
		const cfg: ServerRoute = handler.config;

		// Update path to include base path
		cfg.path = `${(moduleCfg ? moduleCfg.basePath : '')}${cfg.path || ''}`;
		cfg.handler = (<Function>handler.config.handler).bind(module);

		// If options is a function, we'll ignore it.
		if (!(typeof cfg.options === 'function')) {
			if (!cfg.options) {
				cfg.options = {};
			}

			// Auth Priority: Predefined cfg > Route > Module
			if (handler.auth && !cfg.options.auth) {
				cfg.options.auth = handler.auth;
			} else if (!cfg.options.auth && moduleAuth) {
				cfg.options.auth = moduleAuth;
			}

			if (!cfg.options.validate) {
				cfg.options.validate = {};
			}

			// Merge params if not defined.
			if (!cfg.options.validate.params) {
				cfg.options.validate.params = {
					...(<ValidationObject>moduleValidateConfig.params || {}),
					...(<ValidationObject>handler.validation.params || {}),
				};

				if (Object.keys(cfg.options.validate.params).length === 0) {
					delete cfg.options.validate.params;
				}
			}

			// Store Feature Flags
			if (!cfg.options.plugins) {
				cfg.options.plugins = {};
			}

			(<any>cfg.options.plugins).jarFeatureFlags = moduleFeatureFlags.flags; // tslint:disable-line

			if (handler.featureFlags.flags) {
				for (const f of handler.featureFlags.flags) {
					if (!(<any>cfg.options.plugins).jarFeatureFlags.includes(f)) {
						(<any>cfg.options.plugins).jarFeatureFlags.push(f);
					}
				}
			}

			// If query isn't defined. copy values
			if (!cfg.options.validate.query && handler.validation.query) {
				cfg.options.validate.query = handler.validation.query;
			}

			// If payload isn't defined, copy values
			if (!cfg.options.validate.payload && handler.validation.payload) {
				cfg.options.validate.payload = handler.validation.payload;
			}
		}

		routes.push(cfg);
	});

	return routes;
}
