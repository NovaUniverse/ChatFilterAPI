export default abstract class Provider {
	abstract processText(input: string): Promise<string>;
}