import { Lifecycle, ResponseToolkit } from '@hapi/hapi';

export class BaseModule {
	constructor() {
		// no-op
	}

	public noContent(h: ResponseToolkit): Lifecycle.ReturnValue {
		return h.response().code(204).type('application/json');
	}
}
