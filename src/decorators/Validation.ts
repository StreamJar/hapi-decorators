import { RouteOptionsValidate, ValidationObject } from '@hapi/hapi';

const queryConfig: Symbol = Symbol('@streamjar/hapi-decorators:route-query');
const paramConfig: Symbol = Symbol('@streamjar/hapi-decorators:route-param');
const payloadConfig: Symbol = Symbol('@streamjar/hapi-decorators:route-paylaod');

export function getValidationConfig(target: Function): RouteOptionsValidate {
	const config: RouteOptionsValidate = { params: {}, payload: {}, query: {} };

	if (Reflect.hasMetadata(queryConfig, target)) {
		config.query = Reflect.getMetadata(queryConfig, target);
	}

	if (Reflect.hasMetadata(paramConfig, target)) {
		config.params = Reflect.getMetadata(paramConfig, target);
	}

	if (Reflect.hasMetadata(payloadConfig, target)) {
		config.payload = Reflect.getMetadata(payloadConfig, target);
	}

	return config;
}

export function PayloadDecorator(validation: ValidationObject): Function {
	return (target: any): void => {
		Reflect.defineMetadata(payloadConfig, validation, target);
	};
}

export function QueryDecorator(validation: ValidationObject): Function {
	return (target: any): void => {
		Reflect.defineMetadata(queryConfig, validation, target);
	};
}

export function ParamDecorator(validation: ValidationObject): Function {
	return (target: any): void => {
		Reflect.defineMetadata(paramConfig, validation, target);
	};
}
