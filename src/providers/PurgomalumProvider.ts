import Provider from "./AbstractProvider";

export default class PurgomalumProvider extends Provider {
	private filter: any;

	constructor() {
		super();
		const Filter = require("purgomalum-swear-filter");
		this.filter = new Filter();
	}

	processText(input: string): Promise<string> {
		return new Promise(async (resolve, reject) => {
			try {
				const filtered = await this.filter.clean(input);
				resolve(filtered);
			} catch (err) {
				reject(err);
			}
		});
	}
}