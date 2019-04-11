module.exports = {
  configureWebpack: {
    devtool: 'source-map'
  },
  devServer: {
    proxy: {
      '^/api': {
        target: 'http://localhost:8090',
        ws: false,
        changeOrigin: true
      },
      '^/ws': {
        target: 'http://localhost:8090',
        ws: true,
        changeOrigin: true
      }
    }
  }
};
