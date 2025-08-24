const path = require("path");
const rootPath = path.dirname(__filename);

module.exports = {
  apps: [
    {
      name: "site-cpv",
      cwd: rootPath,
      script: ".next/standalone/server.js",
      time: true,
      log_date_format: "YYYY-MM-DD HH:mm Z",
      args: "start",
      instances: "max",
      exec_mode: "cluster",
      watch: false,
      merge_logs: true,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
