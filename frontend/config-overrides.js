// see https://ant.design/docs/react/use-with-create-react-app
const theme = require('./src/config/theme.json');

const { override, fixBabelImports, addLessLoader, adjustStyleLoaders } = require('customize-cra');
module.exports = override(
	fixBabelImports('import', {
		libraryName: 'antd',
		libraryDirectory: 'es',
		style: true,
	}),
	addLessLoader({
		lessOptions: {
			javascriptEnabled: true,
			modifyVars: theme,
		},
	}),
	adjustStyleLoaders(({ use: [, , postcss] }) => {
		const postcssOptions = postcss.options;
		postcss.options = { postcssOptions };
	})
);
