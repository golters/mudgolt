const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const CopyPlugin = require("copy-webpack-plugin")
const webpack = require("webpack")

const dist = path.join(__dirname, "./dist")

console.log("dist path", dist)

module.exports = () => ({
  plugins: [
    new HtmlWebpackPlugin({
      template: "src/index.html",
    }),

    new CopyPlugin({
      patterns: [
        {
          from: "public", 
          to: "",
        },
      ],
    }),

    new webpack.DefinePlugin({
      "NODE_ENV": JSON.stringify(process.env.NODE_ENV),
      "PORT": JSON.stringify(process.env.PORT),
    }),
  ],

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: [
          "style-loader", 
          "css-loader",
        ],
      },
      {
        test: /\.(png|svg|jpg|webp|gif|woff|woff2|eot|ttf|otf|mp3)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              esModule: false,
            },
          },
        ],
      },
      {
        test: /\.(md)$/,
        use: "raw-loader",
      },
    ],
  },

  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx", ".mp3"],
  },

  output: {
    path: dist,
    filename: "[name].bundle.js",
    chunkFilename: "[name].bundle.js",
  },

  target: "web",

  devtool: process.env.NODE_ENV === "production" ? "none" : "source-map",

  devServer: {
    port: process.env.PORT || 5555,
    historyApiFallback: true,
  },
})
