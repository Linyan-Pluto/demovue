<template>
  <!-- 整体布局容器 -->
  <el-container style="height: calc(100vh - 20px); margin: 10px; overflow: hidden;">
    <!-- 头部导航栏 -->
    <el-header style="display: flex; justify-content: space-between; align-items: center; padding: 0 15px;">
      <div class="header-title">
        {{ role === 'admin' ? '总管理后台' : '商铺后台' }}
      </div>
      <div class="header-user">
        欢迎: {{ username }}
        <el-button type="text" @click="logout" style="margin-left: 15px;">退出登录</el-button>
      </div>
    </el-header>

    <!-- 主内容器 -->
    <el-container style="height: calc(100%);">
      <!-- 侧边栏 -->
      <el-aside width="180px" style="background-color: #f5f7fa; border-right: 1px solid #e6e6e6; height: 100%; overflow: hidden;">
        <div class="sidebar-title">系统管理</div>
        <el-menu
          :default-active="activePath"
          class="el-menu-vertical-demo"
          @select="gotoPage"
          background-color="#f5f7fa"
          text-color="#333"
          active-text-color="#409eff"
          style="height: calc(100% - 50px); overflow: auto;"
        >
          <!-- 管理员菜单 -->
          <el-menu-item index="/admin" v-if="role === 'admin'">
            <i class="el-icon-menu"></i>
            <span>首页</span>
          </el-menu-item>
          <el-menu-item index="/admin/merchantManage" v-if="role === 'admin'">
            <i class="el-icon-location"></i>
            <span>商铺管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/dishManage" v-if="role === 'admin'">
            <i class="el-icon-s-tools"></i>
            <span>商品管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/orderManage" v-if="role === 'admin'">
            <i class="el-icon-s-data"></i>
            <span>订单管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/userManage" v-if="role === 'admin'">
            <i class="el-icon-user"></i>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/categoryManage" v-if="role === 'admin'">
            <i class="el-icon-category"></i>
            <span>分类管理</span>
          </el-menu-item>

          <!-- 商户菜单 -->
          <el-menu-item index="/merchant" v-if="role === 'merchant'">
            <i class="el-icon-menu"></i>
            <span>首页</span>
          </el-menu-item>
          <el-menu-item index="/merchant/myDish" v-if="role === 'merchant'">
            <i class="el-icon-s-tools"></i>
            <span>我的菜品</span>
          </el-menu-item>
          <el-menu-item index="/merchant/myOrder" v-if="role === 'merchant'">
            <i class="el-icon-s-data"></i>
            <span>我的订单</span>
          </el-menu-item>
          <el-menu-item index="/merchant/myInfo" v-if="role === 'merchant'">
            <i class="el-icon-user"></i>
            <span>店铺信息</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-main style="padding: 10px; background-color: #fff; border-radius: 8px; margin: 0 10px; height: 100%;">
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
// 核心：确保所有依赖导入正确
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'

// 初始化路由实例
const router = useRouter()
const route = useRoute()

// 从本地存储读取角色和用户名（无数据时给默认值）
const role = ref(localStorage.getItem('role') || 'admin')
const username = ref(localStorage.getItem('username') || '管理员')
// 激活的菜单路径（同步当前路由）
const activePath = ref(route.fullPath)

// 监听路由变化，更新激活的菜单（避免菜单选中状态异常）
watch(
  () => route.fullPath,
  (newPath) => {
    activePath.value = newPath
  },
  { immediate: true }
)

// 菜单点击跳转方法
const gotoPage = (path) => {
  router.push(path)
}

// 退出登录核心方法
const logout = () => {
  ElMessageBox.confirm(
    '确定要退出登录吗？',
    '退出确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 1. 清空所有本地存储（用户信息、token、角色等）
    localStorage.clear()
    // 2. 标准路由跳转
    router.replace('/')
    // 3. 提示退出成功
    ElMessage.success('退出登录成功！')
  }).catch(() => {
    // 取消退出的友好提示
    ElMessage.info('已取消退出登录')
  })
}
</script>

<style scoped>
.el-header {
  background-color: #fff;
  color: #333;
  height: 80px !important;
  line-height: 50px;
  border-bottom: 1px solid #e6e6e6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.header-title {
  font-size: 25px !important;
  font-weight: 700 !important;
  color: #409eff;
}

.header-user {
  font-size: 15px;
}

.sidebar-title {
  height: 45px;
  line-height: 40px;
  padding: 0 15px;
  font-size: 14px;
  font-weight: 600;
  color: #409eff;
  border-bottom: 1px solid #e6e6e6;
}

.el-menu-vertical-demo {
  border-right: none;
}

.el-menu-item {
  height: 45px !important;
  line-height: 40px !important;
  font-size: 15px;
}

.el-main {
  background-color: #f9f9f9 !important;
  padding: 10px !important;
}
</style>