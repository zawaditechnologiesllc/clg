const bundle = require("../artifacts/api-server/dist/index.cjs");
const app = bundle.default || bundle;
module.exports = app;
