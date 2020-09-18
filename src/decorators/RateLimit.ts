import { Request } from '@hapi/hapi';
import { BaseModule } from '../lib/BaseModule';

const ratelimitConfig: Symbol = Symbol('@streamjar/hapi-decorators:route-ratelimit-config');

export interface IRateLimitConfigBase {
	readonly?: boolean,
	shouldLimit?(request: Request): boolean;
	onLimit?(request: Request): void;
}

export interface IRateLimitConfig extends IRateLimitConfigBase {
	bucket: string;
	type: string;
	readonly: boolean;
	shouldLimit?(request: Request): boolean;
	onLimit?(request: Request): void;
}

/**
 * Get the current configuration on a route
 *
 * @param request
 */
export function getRateLimitFromRoute(request: Request): IRateLimitConfig[] {
	return (<any>request.route.settings.plugins).jarRateLimits || [];
}


/**
 * Fetch the rate limit config from a given target.
 *
 * @param module Module or route
 */
export function getRateLimitConfig(module: typeof BaseModule | Function): [] {
	if (!Reflect.hasMetadata(ratelimitConfig, module)) {
		return [];
	}

	return Reflect.getMetadata(ratelimitConfig, module);
}

/**
 * Rate limit a request.
 *
 * @param bucket A bucket to pool requests into
 * @param type The type of requests to pool
 * @param limit The total requests
 * @param duration The duration to measure over.
 */
export function RateLimitDecorator(bucket: string, type: string, opts?: IRateLimitConfigBase): Function {
	return (target: any, _: string, descriptor: PropertyDescriptor): void => {
		const extra: IRateLimitConfigBase = {
			readonly: false,
			...(opts ?? {}),
		}

		Reflect.defineMetadata(ratelimitConfig, [
			...getRateLimitConfig(descriptor ? descriptor.value : target),
			{ bucket, type, ...extra }
		], descriptor ? descriptor.value : target);
	};
}
