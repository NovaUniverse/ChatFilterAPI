import HTTP from "http";
import Express from "express";
import NodeCache from "node-cache";
import { setCorsHeaders } from "./Middleware/CorsMiddleware";
import bodyParser from "body-parser";
import HashUtil from "./HashUtil";
import IResponse from "./IResponse";

export default class ChatFilterServer {
	private express: Express.Express;
	private http: HTTP.Server;
	private cache: NodeCache;

	private filter: any;

	constructor(port: number, cacheTTL: number) {
		const Filter = require("purgomalum-swear-filter");
		this.filter = new Filter();

		this.express = Express();
		this.express.set("port", port);

		this.express.disable('x-powered-by');
		this.express.use(bodyParser.text({}));
		this.express.use(setCorsHeaders);

		this.http = new HTTP.Server(this.express);

		this.express.post("/", async (req: Express.Request, res: Express.Response) => {
			const message = "" + req.body;

			// Prevern errors on empty messages
			if(message.length == 0) {
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
				const filtered = await this.filter.clean(message);

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