import path = require('path');
import webpack = require('webpack');
import MiniCssExtractPlugin = require('mini-css-extract-plugin');
import JsxstyleLoaderPlugin = require('jsxstyle-loader/plugin');
import HtmlWebpackPlugin = require('html-webpack-plugin');

const devMode = process.env.NODE_ENV !== 'production';

const cname = 'jsx.style';
class CnameWebpackPlugin {
  apply(compiler) {
    compiler.hooks.emit.tapAsync(
      'cname-webpack-plugin',
      (compilation, done) => {
        compilation.assets.CNAME = {
          source: () => cname,
          size: () => cname.length,
        };
        done();
      }
    );
  }
}

const config: webpack.Configuration = {
  entry: path.join(__dirname, 'src', 'entrypoint'),

  mode: devMode ? 'development' : 'production',

  context: path.join(__dirname, 'src'),

  devtool: devMode ? 'inline-source-map' : false,

  output: {
    filename: '[name].[hash].js',
    path: path.join(__dirname, 'build'),
    publicPath: '/',
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: devMode ? '[name].css' : '[name].[hash].css',
      chunkFilename: devMode ? '[id].css' : '[id].[hash].css',
    }),
    new JsxstyleLoaderPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src', 'template.ejs'),
      inject: false,
    }),
    new CnameWebpackPlugin(),
  ],

  performance: {
    hints: false,
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['react', ['env', { browsers: ['last 2 versions'] }]],
            },
          },
          'jsxstyle-loader',
          'ts-loader',
        ],
      },
      {
        test: /\.css?$/,
        use: [
          devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              plugins: [require('postcss-cssnext')],
            },
          },
        ],
      },
      {
        test: /\.svg$/,
        use: ['raw-loader'],
      },
    ],
  },
};

export = config;
