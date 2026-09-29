module.exports = {
  apps: [{
    name: 'rootmap-server',
    script: 'src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      HOST: '0.0.0.0',
      PORT: 3000,
      // 敏感项(WX_SECRET / MYSQL_PASSWORD)请勿写死在此文件,
      // 在启动 Shell 中 export 后由 PM2 注入;或填充于生产机的 server/.env(已被 git 忽略)。
      MYSQL_DATABASE: process.env.MYSQL_DATABASE || 'rootmap_1'
    },
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    time: true,
    merge_logs: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};