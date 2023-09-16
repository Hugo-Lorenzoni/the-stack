const path = require("path");
const rootPath = path.dirname(__filename);

module.exports = {
  apps: [
    {
      name: "site-cpv",
      cwd: rootPath,
      script: "node_modules/next/dist/bin/next",
      args: "start",
      instances: 0,
      exec_mode: "cluster",
      watch: false,
      merge_logs: true,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
