import HTTP from "http";
import Express from "express";
import NodeCache from "node-cache";
import { setCorsHeaders } from "./Middleware/CorsMiddleware";
import bodyParser from "body-parser";
import HashUtil from "./HashUtil";
import IResponse from "./IResponse";
import Provider from "./providers/AbstractProvider";
import PurgomalumProvider from "./providers/PurgomalumProvider";
import NoFilteringProvider from "./providers/NoFilteringProvider";
import BadWordsFilter from "bad-words";
import BadWordsProvider from "./providers/BadWordsProvider";
import SwearjarProvider from "./providers/SwearjarProvider";
import DoubleFilterProvider from "./providers/DoubleFilterProvider";

export default class ChatFilterServer {
	private express: Express.Express;
	private http: HTTP.Server;
	private cache: NodeCache;

	private provider: Provider;

	constructor(port: number, cacheTTL: number, filter: string) {
		this.express = Express();
		this.express.set("port", port);

		this.express.disable('x-powered-by');
		this.express.use(bodyParser.text({}));
		this.express.use(setCorsHeaders);

		switch (filter) {
			case "none":
				console.log("Using provider: none");
				this.provider = new NoFilteringProvider();
				break;

			case "purgomalum":
				console.log("Using provider: purgomalum");
				this.provider = new PurgomalumProvider();
				break;

			case "swearjar":
				console.log("Using provider: swearjar");
				this.provider = new SwearjarProvider();
				break;

			case "bad-words":
				console.log("Using provider: bad-words");
				this.provider = new BadWordsProvider();
				break;

			case "double":
				console.log("Using provider: double");
				this.provider = new DoubleFilterProvider();
				break;

			default:
				console.error("Invalid filter: " + filter + ". Using none");
				this.provider = new NoFilteringProvider();
				break;
		}

		this.http = new HTTP.Server(this.express);

		this.express.post("/", async (req: Express.Request, res: Express.Response) => {
			const message = "" + req.body;

			// Prevern errors on empty messages
			if (message.length == 0) {
				const response: IResponse = {
					original: "",
					filtered: "",
					is_clean: true
				}

				res.header("Content-Type", 'application/json');
				res.header("Nova-Cached", "0");
				res.status(200).send(JSON.stringify(response, null, 4));
				return;
			}

			const hash = HashUtil.sha256(message);

			if (this.cache.has(hash)) {
				const response = this.cache.get<IResponse>(hash);
				res.header("Content-Type", 'application/json');
				res.header("Nova-Cached", "1");
				res.header("Nova-IsClean", response.is_clean ? "1" : "0");
				res.status(200).send(JSON.stringify(response, null, 4));
				return;
			}

			try {
				const filtered = await this.provider.processText(message);

				const response: IResponse = {
					original: message,
					filtered: filtered,
					is_clean: filtered == message
				}

				this.cache.set(hash, response);

				res.header("Content-Type", 'application/json');
				res.header("Nova-Cached", "0");
				res.header("Nova-IsClean", response.is_clean ? "1" : "0");
				res.status(200).send(JSON.stringify(response, null, 4));
			} catch (err) {
				console.error("Failed to process input " + message);
				console.error(err);
				res.status(500).send("500: Internal Server Error");
			}
		});

		this.cache = new NodeCache({
			stdTTL: cacheTTL,
			checkperiod: 60
		});

		this.http.listen(port, function () {
			console.log("Listening on port: " + port);
		});
	}
}