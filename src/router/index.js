import { createRouter, createWebHistory } from 'vue-router'

import login from '../views/Login.vue'
import register from '../views/Register.vue'
import AdminLayout from '../views/admin/AdminLayout.vue'

import adminHome from '../views/admin/Home.vue'
import myhome from '../views/merchant/Home.vue'
import merchantManage from '../views/admin/merchantManage.vue'
import dishManage from '../views/admin/DishManage.vue'
import orderManage from '../views/admin/orderManage.vue'
import userManage from '../views/admin/UserManage.vue'
import categoryManage from '../views/admin/categoryManage.vue'
import myDish from '../views/merchant/myDish.vue'
import myOrder from '../views/merchant/myOrder.vue'
import myInfo from '../views/merchant/myInfo.vue'

const routes = [
  { path: '/', component: login,meta: { noAuth: true } }, 
  { path: '/register', component: register,meta: { noAuth: true }}, 

  // 管理员独立路由
  {
    path: '/admin',
    component: AdminLayout,
    meta: { role: 'admin' }, // 标记角色
    children: [
      { path: '', component: adminHome, name: 'adminHome', meta: { role: 'admin' } },
      { path: 'merchantManage', component: merchantManage, meta: { role: 'admin' } },
      { path: 'dishManage', component: dishManage, meta: { role: 'admin' } },
      { path: 'orderManage', component: orderManage, meta: { role: 'admin' } },
      { path: 'userManage', component: userManage, meta: { role: 'admin' } },
      { path: 'categoryManage', component: categoryManage, meta: { role: 'admin' } }
    ]
  },

  // 商户独立路由
  {
    path: '/merchant',
    component: AdminLayout, // 注：命名虽不合理，但保留你的原配置
    meta: { role: 'merchant' },
    children: [
      { path: '', component: myhome, name: 'merchantHome', meta: { role: 'merchant' } },
      { path: 'myDish', component: myDish, meta: { role: 'merchant' } },
      { path: 'myOrder', component: myOrder, meta: { role: 'merchant' } },
      { path: 'myInfo', component: myInfo, meta: { role: 'merchant' } }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const role = localStorage.getItem('role') // 获取本地存储的角色

  // 1. 处理免登录页面（登录/注册）
  if (to.meta.noAuth) {
    // 已登录用户访问登录/注册页 → 跳对应角色首页
    if (role) {
      next(role === 'admin' ? '/admin' : '/merchant')
    } else {
      // 未登录 → 正常放行（访问登录/注册）
      next()
    }
    return
  }

  // 2. 未登录用户访问需权限页面 → 强制跳登录页
  if (!role) {
    next('/')
    return
  }

  // 3. 已登录但角色不匹配 → 跳自身角色首页（防越权）
  if (to.meta.role && to.meta.role !== role) {
    next(role === 'admin' ? '/admin' : '/merchant')
    return
  }

  // 4. 所有校验通过 → 正常放行
  next()
})

export default router