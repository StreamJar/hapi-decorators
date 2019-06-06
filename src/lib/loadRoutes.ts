import { RouteOptionsAccess, RouteOptionsValidate, ServerRoute, ValidationObject } from '@hapi/hapi';
import * as _ from 'lodash';
import { BaseModule } from './BaseModule';

import { getAuthConfig } from '../decorators/Auth';
import { getModuleConfig, IModuleConfig } from '../decorators/Module';
import { getRoutesConfig, IRouteConfig } from '../decorators/Route';
import { getValidationConfig } from '../decorators/Validation';

// tslint:disable-next-line
export function loadRoutes(Module: typeof BaseModule): ServerRoute[] {
	const module: BaseModule = new Module();
	const routeHandlers: IRouteConfig[] = getRoutesConfig(Module);
	const routes: ServerRoute[] = [];

	// Fetch all configurations for the module
	const moduleCfg: IModuleConfig | null = getModuleConfig(Module);
	const moduleAuth: RouteOptionsAccess | null = getAuthConfig(Module);
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
