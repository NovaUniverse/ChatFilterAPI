import BadWordsFilter from "bad-words";
import Provider from "./AbstractProvider";

export default class BadWordsProvider extends Provider {
	private filter: BadWordsFilter;

	constructor() {
		super();
		this.filter = new BadWordsFilter();
	}

	processText(input: string): Promise<string> {
		return new Promise(async (resolve) => {
			resolve(this.filter.clean(input));
		});
	}
}