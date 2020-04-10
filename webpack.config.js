const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
	entry: {
		background: "./src/scripts/background.js",
		options: "./src/scripts/options.js",
		panel: "./src/scripts/panel.js",
	},
	devtool: "cheap-module-source-map",
	module: {
		rules: [
			{
				test: /\.m?js$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: "babel-loader",
					options: {
						presets: ["@babel/preset-env"],
						plugins: [
							"@babel/plugin-proposal-class-properties",
							"@babel/plugin-proposal-private-methods",
						],
					},
				},
			},
		],
	},
	plugins: [
		new CopyPlugin([
			{ from: "./src/manifest.json" },
			{ from: "./src/*.html", flatten: true },
			{ from: "./src/css", to: "css/" },
			{ from: "./src/fonts", to: "fonts/" },
			{ from: "./src/images", to: "images/" },
		]),
	],
};
