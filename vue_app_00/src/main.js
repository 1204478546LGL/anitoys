import Vue from 'vue'
import App from './App.vue'
import router from './router'
import VueRouter from 'vue-router'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

//功能:引入mint-ui组件库
//1.将mint-ui组件库中所有组件引入当前项目
import MintUI from "mint-ui"
//2.单独引入mint-ui样式文件
import "mint-ui/lib/style.css"

//3.注册
Vue.use(MintUI)
Vue.use(ElementUI);
Vue.use(VueRouter);

import axios from "axios"
//7.配置访问服务器基础地址
axios.defaults.baseURL="http://127.0.0.1:4000/"
//8.配置发送请求保存session信息
axios.defaults.withCredentials=true;
//9.将axios注册vue
Vue.prototype.axios = axios;
//10.添加第三方组件库vuex
//11.引入vuex
import Vuex from "vuex"
//12.注册vuex
Vue.use(Vuex);
//13.创建全局存储对象
var store = new Vuex.Store({
  //(1).共享数据
  state:{
    isLogin:false,
  },
  //(2).修改数据方法
  mutations:{
    isLogin(state){
      state.isLogin=true;
    },
  },
  //(3).获取数据方法
  getters:{
    isLogin(state){return state.isLogin}
  },
  //(4).异步修改数据方法
})

new Vue({
  router,
  render: h => h(App),  //App App.vue根组件    
  //14.将全局存储对象添加到Vue实例中作为属性    
  store     
}).$mount('#app')
