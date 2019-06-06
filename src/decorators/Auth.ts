import { RouteOptionsAccess } from '@hapi/hapi';

import { BaseModule } from '../lib/BaseModule';

const authConfig: Symbol = Symbol('@streamjar/hapi-decorators:route-auth-config');

/**
 * Fetch the authentication strategy from a given target.
 *
 * @param module Module or route
 */
export function getAuthConfig(module: typeof BaseModule | Function): RouteOptionsAccess | null {
	if (!Reflect.hasMetadata(authConfig, module)) {
		return null;
	}

	return Reflect.getMetadata(authConfig, module);
}

/**
 * Require authentication on a given route.
 *
 * @param data Authentication strategy or configuration object
 * @param scope Scope(s) to validate.
 */
export function AuthDecorator(data: string | RouteOptionsAccess, scope?: string | string[]): Function {
	const config: RouteOptionsAccess = (typeof data === 'string') ? {
		strategy: data,
		scope: scope || [],
	} : data;

	return (target: any): void => {
		Reflect.defineMetadata(authConfig, config, target);
	};
}
