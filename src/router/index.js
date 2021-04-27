import Vue from 'vue'
import VueRouter from 'vue-router'

const Index = resolve => require(['../views/index.vue'], resolve);

Vue.use(VueRouter)

const routes = [
  {
    path: '/index',
    name: 'index',
    component: Index
  },{
    path: '/',
    name: 'home',
    redirect: '/index'
  }
]

const router = new VueRouter({
  routes
})

export default router
