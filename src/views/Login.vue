<template>
  <div class="login-container">
    <h2>登录</h2>
    <div class="form-item">
      <label>用户名</label>
      <input v-model="username" placeholder="请输入用户名" />
    </div>
    <div class="form-item">
      <label>密码</label>
      <input type="password" v-model="password" placeholder="请输入密码" />
    </div>
    <button @click="login">登录</button>
    <div class="register-link">
      没有账户？<a href="/register" @click.prevent="gotoRegister">立即注册</a>
    </div>
    <div class="msg" :class="msgType">{{ msg }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const username = ref('')
const password = ref('')
const msg = ref('')
const msgType = ref('')
const router = useRouter()

const gotoRegister = () => {
  router.push('/register')
}

const login = async () => {
  if (!username.value) {
    msg.value = '请输入用户名'
    msgType.value = 'error'
    return
  }
  if (!password.value) {
    msg.value = '请输入密码'
    msgType.value = 'error'
    return
  }
  try {
    const response = await axios.post('/api/login', {
      username: username.value,
      password: password.value
    })
    const result = response.data
    if (result.success) {
      msg.value = result.msg
      msgType.value = 'success'
      // 提取角色
      const { role, merchantId, username: user } = result.data || {}
      // 校验角色是否存在
      if (!role) {
        msg.value = '角色异常，请联系管理员'
        msgType.value = 'error'
        return
      }
      // 保存登录信息到本地
      localStorage.setItem('username', user || username.value)
      localStorage.setItem('role', role)
      if (merchantId) localStorage.setItem('merchantId', merchantId)
      // 根据角色跳转
      switch (role) {
        case 'admin':
          router.push('/admin')
          break
        case 'merchant':
          router.push('/merchant')
          break
        case 'user':
          msg.value = '该账号为顾客账号，请通过小程序登录！'
          msgType.value = 'error'
          break
        default:
          msg.value = '角色异常，请联系管理员'
          msgType.value = 'error'
      }
      username.value = ''
      password.value = ''
    } else {
      msg.value = result.msg
      msgType.value = 'error'
    }
  } catch (error) {
    msg.value = '登录失败，请重新尝试'
    msgType.value = 'error'
    console.log('error: ', error)
  }
}
</script>

<style scoped>
.login-container {
  width: 400px;
  margin: 100px auto;
  padding: 30px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.form-item {
  margin: 15px 0;
  text-align: left;
}

.form-item label {
  display: inline-block;
  width: 80px;
  font-size: 14px;
  color: #666;
}

.form-item input {
  width: 280px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
}

.form-item input:focus {
  border-color: #409eff;
}

button {
  width: 100%;
  padding: 10px;
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background: #337ecc;
}

.msg {
  margin-top: 15px;
  height: 20px;
  font-size: 14px;
}

.success {
  color: #67c23a;
}

.error {
  color: #f56c6c;
}

.register-link {
  margin-top: 10px;
  font-size: 12px;
  color: #666;
}

.register-link a {
  color: #409eff;
  cursor: pointer;
}
</style>