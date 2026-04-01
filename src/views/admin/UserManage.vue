<template>
  <div class="user-manage-page">
    <BaseCrud
      ref="baseCrudRef"
      :search-config="searchConfig"
      :table-columns="tableColumns"
      :form-items="formItems"
      :form-rules="formRules"
      :api="api"
      :show-operate-column="true"
    >
      <!-- 状态列插槽 -->
      <template #statusSlot="scope">
        <el-button
          :type="scope.row.status === 1 ? 'warning' : 'success'"
          size="small"
          class="status-btn"
          @click="handleToggleStatus(scope.row)"
          :loading="loadingStatus === scope.row.id"
        >
          {{ scope.row.status === 1 ? '禁用' : '启用' }}
        </el-button>
      </template>

      <!-- 注册时间列插槽 -->
      <template #createTimeSlot="scope">
        {{ formatDate(scope.row.createTime) }}
      </template>

      <!-- 新增：操作列插槽（新增重置密码按钮） -->
      <template #operateSlot="scope">
        <div class="op-btn-group">
          <el-button 
            size="mini" 
            type="success" 
            icon="el-icon-refresh" 
            @click="handleResetPassword(scope.row)"
          >
            重置密码
          </el-button>
        </div>
      </template>
    </BaseCrud>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import BaseCrud from '@/components/BaseCrud.vue'
import { adminUserApi, getAdminUserList } from '@/api/adminUser'
import { ElMessage, ElMessageBox } from 'element-plus' // 新增：引入ElMessageBox

const baseCrudRef = ref(null)
const loadingStatus = ref('')

// 搜索配置
const searchConfig = ref([
  {
    prop: 'username',
    label: '用户名',
    type: 'input',
    placeholder: '请输入用户名'
  },
  {
    prop: 'phone',
    label: '手机号',
    type: 'input',
    placeholder: '请输入手机号'
  },
  {
    prop: 'status',
    label: '用户状态',
    type: 'select',
    placeholder: '请选择用户状态',
    options: [
      { label: '正常', value: 1 },
      { label: '禁用', value: 0 }
    ]
  },
  {
    prop: 'role',
    label: '用户角色',
    type: 'select',
    placeholder: '请选择用户角色',
    options: [
      { label: '管理员', value: 'admin' },
      { label: '普通用户', value: 'user' },
      { label: '商户', value: 'merchant' }
    ]
  },
  { 
    label: '注册时间', 
    prop: 'createTime', 
    type: 'date', 
    placeholder: '请选择注册日期' 
  }
])

// 表格列配置：新增操作列
const tableColumns = ref([
  {
    prop: 'id',
    label: 'ID',
    minWidth: 80,
    align: 'center'
  },
  {
    prop: 'username',
    label: '用户名',
    minWidth: 120,
    align: 'center'
  },
  {
    prop: 'phone',
    label: '手机号',
    minWidth: 130,
    align: 'center'
  },
  {
    prop: 'role',
    label: '用户角色',
    minWidth: 120,
    align: 'center'
  },
  {
    prop: 'createTime',
    label: '注册时间',
    minWidth: 180,
    align: 'center',
    slot: 'createTimeSlot'
  },
  {
    prop: 'status',
    label: '用户状态',
    minWidth: 100,
    align: 'center',
    slot: 'statusSlot'
  },
  //操作列（绑定operateSlot插槽）
  {
    label: '操作',
    prop: 'operate',
    minWidth: 120,
    align: 'center',
    slot: 'operateSlot'
  }
])

// 表单配置
const formItems = ref([
  {
    prop: 'id',
    type: 'input',
    hidden: true
  },
  {
    prop: 'username',
    label: '用户名',
    type: 'input',
    placeholder: '请输入用户名',
    attrs: {
      maxlength: 20,
      showWordLimit: true
    }
  },
  {
    prop: 'phone',
    label: '手机号',
    type: 'input',
    placeholder: '请输入11位手机号',
    attrs: {
      maxlength: 11,
      showWordLimit: true
    }
  },
  {
    prop: 'role',
    label: '用户角色',
    type: 'select',
    placeholder: '请选择用户角色',
    options: [
      { label: '管理员', value: 'admin' },
      { label: '普通用户', value: 'user' },
      { label: '商户', value: 'merchant' }
    ]
  },
  {
    prop: 'password',
    label: '密码',
    type: 'input',
    placeholder: '请输入密码（新增必填，编辑可不填）',
    attrs: {
      type: 'password',
      maxlength: 20,
      showWordLimit: true
    }
  }
])

// 表单校验规则
const formRules = ref({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在2-20之间', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的11位手机号', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择用户角色', trigger: 'change' }
  ],
  password: [
    { 
      required: false,
      message: '请输入密码', 
      trigger: 'blur', 
      validator: (rule, value, callback) => {
        const isEdit = baseCrudRef.value?.isEdit || false
        if (isEdit && !value) {
          callback()
        } else if (!isEdit && !value) {
          callback(new Error('新增时密码不能为空'))
        } else {
          callback()
        }
      }
    }
  ]
})

// API包装
const api = ref({
  list: async (params) => {
    try {
      const queryParams = { ...params }
      if (queryParams.createTime) {
        queryParams.startTime = `${queryParams.createTime} 00:00:00`
        queryParams.endTime = `${queryParams.createTime} 23:59:59`
        delete queryParams.createTime
      }
      const res = await getAdminUserList(queryParams)
      return {
        list: res.list || [],
        total: res.total || 0
      }
    } catch (error) {
      console.error("用户列表查询失败：", error)
      return { list: [], total: 0 }
    }
  },
  add: async (data) => {
    // 手动补充正常状态（status: 1），用户看不到但会提交给后端
    const submitData = {
      ...data, // 保留用户输入的用户名、手机号、角色、密码等
      status: 1 // 默认设置为正常状态
    }
    // 调用原有新增接口
    return await adminUserApi.add(submitData)
  },
  edit: adminUserApi.edit,
  del: adminUserApi.del,
  toggleStatus: adminUserApi.toggleStatus
})

// 日期格式化方法
const formatDate = (time) => {
  if (!time) return ''
  try {
    const dateStr = typeof time === 'string' ? time.replace('T', ' ') : time
    const date = new Date(dateStr)
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
  } catch (err) {
    console.error('日期格式化失败：', err)
    return time
  }
}

// 状态切换方法
const handleToggleStatus = async (row) => {
  try {
    loadingStatus.value = row.id
    const oldStatus = row.status
    const targetStatus = oldStatus === 1 ? 0 : 1

    await adminUserApi.toggleStatus({ id: row.id, status: targetStatus })

    row.status = targetStatus
    ElMessage.success(targetStatus === 1 ? '用户已启用' : '用户已禁用')

    if (baseCrudRef.value) {
      baseCrudRef.value.getlist()
    }
  } catch (err) {
    row.status = oldStatus
    ElMessage.error(err.message || '用户状态切换失败')
    console.error('状态切换失败：', err)
  } finally {
    loadingStatus.value = ''
  }
}

// 新增：重置密码核心方法
const handleResetPassword = async (row) => {
  try {
    // 弹窗确认，防止误操作
    await ElMessageBox.confirm(
      '确定要将该用户密码重置为默认密码「123456」吗？重置后用户可使用默认密码登录',
      '密码重置确认',
      {
        confirmButtonText: '确认重置',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 调用重置密码API
    await adminUserApi.resetPassword({ id: row.id })
    ElMessage.success('用户密码已成功重置为123456')
  } catch (err) {
    // 取消操作或接口失败时的提示
    if (err.message !== 'cancel') {
      ElMessage.error(err.message || '密码重置失败')
      console.error('重置密码失败：', err)
    } else {
      ElMessage.info('已取消密码重置')
    }
  }
}
</script>

<style scoped>
.user-manage-page {
  padding: 10px;
  width: 100%;
  box-sizing: border-box;
}

.status-btn {
  width: 80px !important;
  height: 28px !important;
  font-size: 12px !important;
}

:deep(.el-table) {
  width: 100% !important;
}

:deep(.el-pagination) {
  width: 100% !important;
  margin-top: 10px;
  text-align: right;
}

.op-btn-group {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
}
</style>