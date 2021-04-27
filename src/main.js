import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// ElementUI
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);

// vant
import { Popup, Toast } from 'vant';
import 'vant/lib/index.css';
Vue.use(Popup);
Vue.use(Toast);

// common 公用方法
import Common from './common/common_vue.js'
Vue.prototype.$common = Common;
// md5
import md5 from 'blueimp-md5';
Vue.prototype.$md5 = md5;
// axios
import Axios from 'axios';
window.Axios = Axios;
// 封装axois
import requestConfig from './common/requireConfig.js';
Vue.prototype.$axios = requestConfig.apiHttp;
Vue.prototype.$axiosFile = requestConfig.apiHttpForm;

// 服务器地址
import serverConfig from './common/serverConfig.js';
Vue.prototype.$serverConfig = serverConfig;

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
