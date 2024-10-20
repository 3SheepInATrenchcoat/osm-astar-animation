const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  // mode: "production", // production | development
  entry: {
    app: "./src/ts/main/script.ts"
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "./js/script.js",
    clean: true,
  },
  devServer: {
    port: 3000,
    open: true,
    hot: true,
    compress: true,
    historyApiFallback: true,
    watchFiles: ["src/**/*"]
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        include: path.resolve(__dirname, "src"),
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          configFile: path.resolve(__dirname, "src/ts/main/tsconfig.json"),
        }
      },
    ],
  },
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: [".ts", ".tsx", ".js"]
  },
  optimization: {
    minimize: true,
    minimizer: [new CssMinimizerPlugin(), new TerserPlugin()],
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: "css/styles.css" }),
    new HtmlWebpackPlugin({
      template: "src/index.html",
    }),
    new CopyPlugin({
      patterns: [
        { from: "src/css/styles.css", to: "css/styles.css" },
        { from: "src/images", to: "images" },
        { from: "src/fonts", to: "fonts" },
      ],
    }),

  ],
};
