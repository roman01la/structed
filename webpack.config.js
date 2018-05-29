const path = require("path");

module.exports = {
  entry: "./src/index.js",
  output: {
    library: "struct",
    libraryTarget: "umd",
    path: path.join(__dirname, "dist"),
    filename: "bundle.js"
  }
};
