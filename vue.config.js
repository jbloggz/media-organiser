module.exports = {
  configureWebpack: {
    devtool: 'source-map'
  },
  outputDir: 'dist/public/',
  devServer: {
    proxy: {
      '^/api': {
        target: 'http://localhost:8090',
        ws: false,
        changeOrigin: true
      },
      '^/ws': {
        target: 'ws://localhost:8090/ws',
        ws: true,
        changeOrigin: true
      }
    }
  }
};
