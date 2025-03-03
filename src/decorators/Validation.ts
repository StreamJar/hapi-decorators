import { RouteOptionsValidate, ValidationObject } from '@hapi/hapi';

const queryConfig: Symbol = Symbol('@streamjar/hapi-decorators:route-query');
const paramConfig: Symbol = Symbol('@streamjar/hapi-decorators:route-param');
const payloadConfig: Symbol = Symbol('@streamjar/hapi-decorators:route-paylaod');

export function getValidationConfig(target: Function): RouteOptionsValidate {
	const config: RouteOptionsValidate = { };

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
	return (target: any, _: string, descriptor: PropertyDescriptor): void => {
		Reflect.defineMetadata(payloadConfig, validation, descriptor ? descriptor.value : target);
	};
}

export function QueryDecorator(validation: ValidationObject): Function {
	return (target: any, _: string, descriptor: PropertyDescriptor): void => {
		Reflect.defineMetadata(queryConfig, validation, descriptor ? descriptor.value : target);
	};
}

export function ParamDecorator(validation: ValidationObject): Function {
	return (target: any, _: string, descriptor: PropertyDescriptor): void => {
		Reflect.defineMetadata(paramConfig, validation, descriptor ? descriptor.value : target);
	};
}
