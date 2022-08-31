import { sha256 } from "sha.js"

export default class HashUtil {
	public static sha256(input: string): string {
		const hash = new sha256();
		return hash.update(input).digest("hex");
	}
}