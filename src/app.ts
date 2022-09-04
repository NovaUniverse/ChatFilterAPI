import * as FS from "fs";
import ChatFilterServer from "./ChatFilterServer";

require('console-stamp')(console, '[HH:MM:ss.l]');

if (!FS.existsSync("./config")) {
	FS.mkdirSync("./config");
}

if (!FS.existsSync("./config/config.json")) {
    console.log("Creating default configuration");
	let defaultConfig: any = {
		port: 80,
		cache_ttl: 60 * 60 * 1, // 1 hour
		provider: "purgomalum"
	}
	FS.writeFileSync("./config/config.json", JSON.stringify(defaultConfig, null, 4), 'utf8');
}

const config: any = JSON.parse(FS.readFileSync("./config/config.json", 'utf8'));

new ChatFilterServer(config.port, config.cache_ttl, config.provider);