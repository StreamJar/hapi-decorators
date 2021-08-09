import { Lifecycle } from '@hapi/hapi';
import Joi from 'joi';

import { BaseModule, Get, Module, Params } from '../../src';

@Module({
	basePath: '/channels/{channel}/info',
})
@Params({
	channel: Joi.number().required(),
})
export class DemoRoutes extends BaseModule {

	@Get('/{info}')
	@Params({
		info: Joi.string().max(10),
	})
	// @Auth('token', ['channel:statistics:view'])
	public async getAll(): Promise<Lifecycle.ReturnValue> {
		return {
			status: true,
		};
		// return this.noContent(h);
	}
}
