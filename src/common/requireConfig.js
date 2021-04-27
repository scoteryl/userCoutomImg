// axios
import Axios from 'axios';

// 服务器地址配置文件
import serverConfig from './serverConfig.js';

console.log(serverConfig);

function getCookie(objName) {//获取指定名称的cookie的值
  var arrStr = document.cookie.split("; ");
  for (var i = 0; i < arrStr.length; i++) {
      var temp = arrStr[i].split("=");
      if (temp[0] == objName) return unescape(temp[1]);  //解码
  }
  return "";
}


// bi 后端Api请求
const apiHttp = Axios.create({
  baseURL: serverConfig.serverUrl,
  headers: {
    // 'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Type': 'application/json;charset=UTF-8',
  }
});
const apiHttpForm = Axios.create({
  baseURL: serverConfig.serverUrl,
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});

// 拦截器加head头信息
apiHttp.interceptors.request.use(
  config => {
    var sessionId = sessionStorage.getItem('user_sessionId');
    if (sessionId) { // 判断是否存在token，如果存在的话，则每个http header都加上token
      config.headers.sessionId = sessionId  //请求头加上token
    }
    return config
  },
  err => {
    return Promise.reject(err)
  }
);
apiHttpForm.interceptors.request.use(
  config => {
    var sessionId = sessionStorage.getItem('user_sessionId');
    if (sessionId) { // 判断是否存在token，如果存在的话，则每个http header都加上token
      config.headers.sessionId = sessionId  //请求头加上token
    }
    return config
  },
  err => {
    return Promise.reject(err)
  }
);
apiHttp.interceptors.response.use(response => {

  return response
});
apiHttpForm.interceptors.response.use(response => {

  return response
});

export default {
  apiHttp,
  apiHttpForm,
}