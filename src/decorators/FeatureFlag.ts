import { BaseModule } from '../lib/BaseModule';

const featureflagConfig: Symbol = Symbol('@streamjar/hapi-decorators:route-featureflag-config');

/**
 * Fetch the featureflagentication strategy from a given target.
 *
 * @param module Module or route
 */
export function getFeatureFlagConfig(module: typeof BaseModule | Function): { flags: string[] } {
	if (!Reflect.hasMetadata(featureflagConfig, module)) {
		return { flags: [] };
	}

	return Reflect.getMetadata(featureflagConfig, module);
}

/**
 * Require a specific FeatureFlag on a given route.
 *
 * @param data FeatureFlagentication strategy or configuration object
 * @param scope Scope(s) to validate.
 */
export function FeatureFlagDecorator(scope?: string | string[]): Function {
	return (target: any, _: string, descriptor: PropertyDescriptor): void => {
		Reflect.defineMetadata(featureflagConfig, { flags: Array.isArray(scope) ? scope : [scope] }, descriptor ? descriptor.value : target);
	};
}
