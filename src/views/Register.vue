<template>
  <div class="register-container">
    <h2 class="register-title">用户注册</h2>
    <div class="form-item">
      <label>用户名</label>
      <input v-model="username" placeholder="请输入用户名" />
    </div>
    <div class="form-item">
      <label>密码</label>
      <input type="password" v-model="password" placeholder="请输入4~8位密码" />
    </div>
    <div class="form-item">
      <label>电话</label>
      <input v-model="phone" placeholder="请输入11位手机号" />
    </div>
    <div class="btn-group">
      <button @click="register" class="btn btn-primary">确定</button>
      <button @click="gotoLogin" class="btn btn-default">取消</button>
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
const phone = ref('')
const msg = ref('')
const msgType = ref('')
const router = useRouter()

const gotoLogin = () => {
  router.push('/')
}

const register = async () => {
  if (!username.value) {
    msg.value = '请输入用户名'
    msgType.value = 'error'
    return
  }
  if (!password.value) {
    msg.value = '请输入4~8位密码'
    msgType.value = 'error'
    return
  }
  if (password.value.length < 4 || password.value.length > 8) {
    msg.value = '密码长度必须为4~8位'
    msgType.value = 'error'
    return
  }
  if (!phone.value) {
    msg.value = '请输入联系电话'
    msgType.value = 'error'
    return
  }
  // 手机号格式验证
  const phoneReg = /^1[3-9]\d{9}$/
  if (!phoneReg.test(phone.value)) {
    msg.value = '请输入有效的11位手机'
    msgType.value = 'error'
    return
  }

  try {
    const response = await axios.post('/api/register', {
      username: username.value,
      password: password.value,
      phone: phone.value,
      role: 'merchant'
    })
    const result = response.data
    if (result.success) {
      msg.value = result.msg
      msgType.value = 'success'
      // 跳转逻辑
      setTimeout(() => {
        router.push('/')
      }, 1000)
    } else {
      msg.value = result.msg
      msgType.value = 'error'
    }
  } catch (error) {
    msg.value = '注册失败，请重新尝试'
    msgType.value = 'error'
    console.log('error', error)
  }
}
</script>

<style scoped>
.register-container {
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

.btn-group {
  text-align: center;
  margin-top: 10px;
}

.btn {
  width: 100px;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin: 0 5px;
}

.btn-primary {
  background: #409eff;
  color: #fff;
}

.btn-primary:hover {
  background: #337ecc;
}

.btn-default {
  background: #f5f5f5;
  color: #666;
}

.btn-default:hover {
  background: #e6e6e6;
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
</style>