module.exports = {
  apps: [
    {
      name: "node-load-testing-app",
      script: "./src/server.js",
      exec_mode: "cluster",
      instances: 2,

      // Basic reliability
      min_uptime: "10s",
      max_restarts: 10,

      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },

      // Basic logging only
      out_file: "./logs/out.log",
      error_file: "./logs/error.log",
    },
  ],
};
