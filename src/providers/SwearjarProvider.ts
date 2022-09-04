import Provider from "./AbstractProvider";

export default class SwearjarProvider extends Provider {
	private swearjar: any;

	constructor() {
		super();
		this.swearjar = require('swearjar');
	}

	processText(input: string): Promise<string> {
		return new Promise(async (resolve) => {
			resolve(this.swearjar.censor(input));
		});
	}
}