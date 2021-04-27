const Timestamp = new Date().getTime();

module.exports = {
  pages: {
    // 报表配置页面
    index: {
      entry: './src/main.js',
      template: './public/index.html',
      filename: 'index.html'
    }
  },
  // 基本路径
  publicPath: './',
  // 输出文件目录
  outputDir: 'dist',
  // eslint-loader 是否在保存的时候检查
  // lintOnSave: true,
  // use the full build with in-browser compiler?
  // https://vuejs.org/v2/guide/installation.html#Runtime-Compiler-vs-Runtime-only
  // compiler: false,
  // webpack配置
  // see https://github.com/vuejs/vue-cli/blob/dev/docs/webpack.md
  chainWebpack: () => {},
  // configureWebpack: () => {},
  configureWebpack: {
    output: {
      filename: `[name].[hash].${Timestamp}.js`,
      chunkFilename: `[name].[hash].${Timestamp}.js`
    }
  },
  // vue-loader 配置项
  // https://vue-loader.vuejs.org/en/options.html
  // vueLoader: {},
  // 生产环境是否生成 sourceMap 文件
  productionSourceMap: false,
  // css相关配置
  css: {
    extract: true, // 是否使用css分离插件 ExtractTextPlugin
    sourceMap: false, // 开启 CSS source maps?
    loaderOptions: {
        css: {}, // 这里的选项会传递给 css-loader
        postcss: {} // 这里的选项会传递给 postcss-loader
    }, // css预设器配置项 详见https://cli.vuejs.org/zh/config/#css-loaderoptions
    requireModuleExtension: true // 启用 CSS modules for all css / pre-processor files.
  },
  // use thread-loader for babel & TS in production build
  // enabled by default if the machine has more than 1 cores
  // parallel: require('os').cpus().length > 1,
  // 是否启用dll
  // See https://github.com/vuejs/vue-cli/blob/dev/docs/cli-service.md#dll-mode
  // dll: false,
  // PWA 插件相关配置
  // see https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-pwa
  pwa: {},
  // webpack-dev-server 相关配置
  devServer: {
    open: process.platform === 'darwin',
    host: '0.0.0.0',
    port: 8088,
    https: false,
    hotOnly: false,
    // proxy: null, // 设置代理
    proxy: {
      '/localServerAPI': {
        // target: 'http://alpcontrol.runker.top:4090/bi',
        target: 'http://localhost:8080',
        // target: 'http://192.168.1.114:8080',
        changeOrigin: true,
        pathRewrite: {
          '^/localServerAPI': ''
        }
      },
      '/cpServerAPI': {
        // target: 'http://alpcontrol.runker.top:4080',
        target: 'http://localhost:8080',
        // target: 'http://192.168.1.120:8080',
        changeOrigin: true,
        pathRewrite: {
          '^/cpServerAPI': ''
        }
      }
    },
    before: app => {}
  },
  // // 第三方插件配置
  // pluginOptions: {
  //  // ...
  // }
}
