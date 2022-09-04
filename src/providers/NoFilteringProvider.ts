import Provider from "./AbstractProvider";

export default class NoFilteringProvider extends Provider {
	processText(input: string): Promise<string> {
		return new Promise((resolve) => resolve(input));
	}
}