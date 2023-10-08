const path = require("path");
const rootPath = path.dirname(__filename);

module.exports = {
  apps: [
    {
      name: "site-cpv",
      cwd: rootPath,
      script: "node_modules/next/dist/bin/next",
      time: true,
      log_date_format: "YYYY-MM-DD HH:mm Z",
      args: "start",
      instances: 2,
      exec_mode: "cluster",
      watch: false,
      merge_logs: true,
      env: {
        NODE_ENV: "production",
      },
      node_args: "--max-old-space-size=1024",
    },
  ],
};
