const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
module.exports = {
  publicPath: "/dist/",
  transpileDependencies: ["vuetify"],
  configureWebpack: {
    plugins: [new MonacoWebpackPlugin()],
  },
};
