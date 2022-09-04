import BadWordsFilter from "bad-words";
import Provider from "./AbstractProvider";

export default class DoubleFilterProvider extends Provider {
	private swearjar: any;
	private filter: BadWordsFilter;

	constructor() {
		super();
		this.swearjar = require('swearjar');
		this.filter = new BadWordsFilter();
	}

	processText(input: string): Promise<string> {
		return new Promise(async (resolve) => {
			resolve(this.swearjar.censor(this.filter.clean(input)));
		});
	}
}