import { Lifecycle, ResponseToolkit } from '@hapi/hapi';

export class BaseModule {
	constructor() {
		// no-op
	}

	public noContent(h: ResponseToolkit): Lifecycle.ReturnValue {
		return h.response().code(204).type('application/json');
	}

	// tslint:disable-next-line no-any
	public withStatus(h: ResponseToolkit, code: number, data: any): Lifecycle.ReturnValue {
		return h.response(data).code(code);
	}
}
