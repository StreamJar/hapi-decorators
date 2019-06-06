import { promises as fs } from 'fs';
import * as _ from 'lodash';
import { join } from 'path';
import { BaseModule } from '../lib/BaseModule';

const REGEX_ROUTES: RegExp = /\.routes\.(ts|js)$/;

export async function searchDirectory(dir: string): Promise<string[]> {
	if (!(await fs.stat(dir)).isDirectory()) {
		return [dir];
	}

	const dirs: string[][] = await Promise.all((await fs.readdir(dir))
		.map(async (loc: string) => {
			const newDir: string = join(dir, loc);

			if ((await fs.stat(newDir)).isDirectory()) {
				return searchDirectory(newDir);
			}

			return [join(dir, loc)];
		}));

	return _(dirs).flatten().value();
}

export async function loadModulesFromPath(paths: string): Promise<typeof BaseModule[]> {
	return searchDirectory(paths)
		.then((path: string[]) => {
			return path
				.filter((path: string) => REGEX_ROUTES.test(path))
				.map((file: string) => {
					const exportFile: any = require(file); // tslint:disable-line

					return Object.keys(exportFile).map((exported: string) => {
						if ((exportFile)[exported].prototype instanceof BaseModule) {
							return (exportFile)[exported];
						}

						return undefined;
					});
				})
				.reduce((old: typeof BaseModule[], newV: typeof BaseModule[]) => old.concat(newV), [])
				.filter((mod: typeof BaseModule) => mod !== undefined);
		});
}
