import { fileURLToPath } from "node:url";

import type { AstroIntegration } from "astro";

import { brotli, gzip } from "./compress.js";

const defaultFileExtensions = [".css", ".js", ".html", ".xml", ".cjs", ".mjs", ".svg", ".txt"];

interface Options {
	/** Enable gzip compression */
	gzip?: boolean;
	/** Enable brotli compression */
	brotli?: boolean;
	/** Extensions to compress, must be in the format `.html`, `.css` etc */
	fileExtensions?: Array<string>;
	/** Number of files to batch process */
	batchSize?: number;
}

const defaultOptions: Required<Options> = {
	gzip: true,
	brotli: true,
	fileExtensions: defaultFileExtensions,
	batchSize: 10,
};

export default function (opts: Options = defaultOptions): AstroIntegration {
	const options = { ...defaultOptions, ...opts };

	return {
		name: "astro-compressor",
		hooks: {
			"astro:build:done": async ({ dir, logger }) => {
				const path = fileURLToPath(dir);
				await Promise.allSettled([
					gzip(path, logger, options.fileExtensions, options.gzip, options.batchSize),
					brotli(path, logger, options.fileExtensions, options.brotli, options.batchSize),
				]);
				logger.info("Compression finished\n");
			},
		},
	};
}
