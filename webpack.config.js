const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const webpack = require('webpack');
const BundleTracker = require('webpack-bundle-tracker');

module.exports = (env, argv) => {
  const isDev = argv.mode === 'development';
  const isStandalone = process.env.STANDALONE === '1' || process.env.VERCEL === '1';
  const nodeModulesDir = path.resolve(__dirname, 'node_modules');

  const localhostOutput = {
    path: path.resolve('./frontend/webpack_bundles/'),
    publicPath: 'http://localhost:3000/frontend/webpack_bundles/',
    filename: '[name].js',
  };
  const productionOutput = {
    path: path.resolve('./frontend/webpack_bundles/'),
    publicPath: '/static/',
    filename: '[name]-[chunkhash].js',
    clean: true,
  };
  const standaloneOutput = {
    path: path.resolve('./frontend/dist'),
    publicPath: '/',
    filename: 'assets/[name]-[contenthash].js',
    clean: true,
  };

  let output = productionOutput;
  if (isStandalone) {
    output = standaloneOutput;
  } else if (isDev) {
    output = localhostOutput;
  }

  return {
    mode: isDev ? 'development' : 'production',
    devtool: 'source-map',
    devServer: {
      hot: true,
      historyApiFallback: true,
      host: '0.0.0.0',
      port: 3000,
      headers: { 'Access-Control-Allow-Origin': '*' },
      proxy: isStandalone
        ? [
            {
              context: ['/api', '/media'],
              target: process.env.ARTEMIS_API_BASE_URL || 'http://127.0.0.1:8000',
              changeOrigin: true,
            },
          ]
        : undefined,
    },
    context: __dirname,
    entry: ['./frontend/js/index.tsx'],
    output,
    module: {
      rules: [
        {
          test: /\.(js|mjs|jsx|ts|tsx)$/,
          use: {
            loader: 'swc-loader',
            options: {
              jsc: {
                parser: {
                  syntax: 'typescript',
                  tsx: true,
                },
                transform: {
                  react: {
                    runtime: 'automatic',
                  },
                },
              },
            },
          },
        },
        {
          test: /\.css$/,
          use: [
            isDev && 'style-loader',
            !isDev && MiniCssExtractPlugin.loader,
            { loader: 'css-loader', options: { importLoaders: 1 } },
            'postcss-loader',
          ].filter(Boolean),
        },
        {
          test: /\.(svg)(\?v=\d+\.\d+\.\d+)?$/,
          type: 'asset',
        },
        {
          test: /\.(woff(2)?|eot|ttf|otf)(\?v=\d+\.\d+\.\d+)?$/,
          type: 'asset',
        },
        {
          test: /\.(png|jpg|jpeg|gif|webp)?$/,
          type: 'asset',
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.ARTEMIS_API_BASE_URL': JSON.stringify(
          process.env.ARTEMIS_API_BASE_URL || '',
        ),
      }),
      !isDev &&
        new MiniCssExtractPlugin({
          filename: isStandalone ? 'assets/[name]-[contenthash].css' : '[name]-[chunkhash].css',
        }),
      isDev && new ReactRefreshWebpackPlugin(),
      !isStandalone &&
        new BundleTracker({
          path: __dirname,
          filename: 'webpack-stats.json',
        }),
      isStandalone &&
        new HtmlWebpackPlugin({
          template: path.resolve(__dirname, 'frontend/public/index.html'),
          filename: 'index.html',
          inject: 'body',
        }),
      isStandalone &&
        new CopyWebpackPlugin({
          patterns: [
            {
              from: path.resolve(
                __dirname,
                'frontend/assets/images/brand/favicon.ico',
              ),
              to: path.resolve(__dirname, 'frontend/dist/favicon.ico'),
            },
            {
              from: path.resolve(
                __dirname,
                'frontend/assets/images/brand/favicon-16.png',
              ),
              to: path.resolve(__dirname, 'frontend/dist/favicon-16.png'),
            },
            {
              from: path.resolve(
                __dirname,
                'frontend/assets/images/brand/favicon-32.png',
              ),
              to: path.resolve(__dirname, 'frontend/dist/favicon-32.png'),
            },
            {
              from: path.resolve(
                __dirname,
                'frontend/assets/images/brand/apple-touch-icon.png',
              ),
              to: path.resolve(__dirname, 'frontend/dist/apple-touch-icon.png'),
            },
          ],
        }),
      new NodePolyfillPlugin(),
      new webpack.ProvidePlugin({ Buffer: ['buffer', 'Buffer'] }),
    ].filter(Boolean),
    resolve: {
      fullySpecified: false,
      modules: [nodeModulesDir, path.resolve(__dirname, 'frontend/js/')],
      alias: { '@': path.resolve(__dirname, 'frontend') },
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    optimization: {
      minimize: !isDev,
      splitChunks: {
        chunks: 'all',
      },
    },
  };
};
