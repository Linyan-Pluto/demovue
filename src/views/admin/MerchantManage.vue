<template>
  <base-crud
    ref="merchantCrudRef"
    :search-config="searchConfig"
    :table-columns="tableColumns"
    :form-items="formItems"
    :form-rules="formRules"
    :api="api"
    border
    :show-operate-column="true" 
  >
    <!-- 状态列插槽 -->
    <template #merchant-status="slotProps">
      <el-button
        size="small"
        :type="slotProps.row.status === 1 ? 'warning' : 'success'"
        @click="handleMerchantStatusToggle(slotProps.row)"
        class="merchant-status-btn"
        style="width: 80px; margin: 0 auto;"
      >
        {{ slotProps.row.status === 1 ? '禁用' : '启用' }}
      </el-button>
    </template>
  </base-crud>
</template>

<script setup>
import { ref } from 'vue';
import BaseCrud from '@/components/BaseCrud.vue';
import { ElMessage } from 'element-plus';
import { 
  getMerchantList, 
  addMerchant, 
  updateMerchant, 
  deleteMerchant, 
  toggleMerchantStatus
} from '@/api/merchant';

// 绑定BaseCrud的ref，用于刷新列表
const merchantCrudRef = ref(null);

// 1. 搜索栏配置
const searchConfig = ref([
  { label: '商户名称', prop: 'merchantName', type: 'input', placeholder: '请输入商户名称' },
  { label: '商户地址', prop: 'address', type: 'input', placeholder: '请输入商户地址' },
  { label: '联系人', prop: 'contact', type: 'input', placeholder: '请输入联系人' },
  { label: '商户状态', prop: 'status', type: 'select', options: [
    { label: '正常', value: 1 },
    { label: '禁用', value: 0 }
  ], placeholder: '请选择商户状态' },
  { label: '创建时间', prop: 'createTime', type: 'date', placeholder: '请选择创建日期' }
]);

// 2. 表格列配置
const tableColumns = ref([
  { label: 'ID', prop: 'id', width: '80px', align: 'center' },
  { label: '商户名称', prop: 'merchantName', width: '200px' },
  { label: '联系人', prop: 'contact', width: '120px', align: 'center' },
  { label: '联系电话', prop: 'phone', width: '150px', align: 'center' },
  { label: '地址', prop: 'address', minWidth: '200px' },
  { 
    label: '商户状态', 
    prop: 'status', 
    width: '100px', 
    align: 'center',
    slot: 'merchant-status'
  }
]);

// 3. 弹窗表单配置
const formItems = ref([
  { label: 'ID', prop: 'id', type: 'input', hidden: true },
  { label: '商户名称', prop: 'merchantName', type: 'input', placeholder: '请输入商户名称' },
  { label: '联系人', prop: 'contact', type: 'input', placeholder: '请输入联系人' },
  { label: '联系电话', prop: 'phone', type: 'input', placeholder: '请输入联系电话' },
  { label: '地址', prop: 'address', type: 'input', placeholder: '请输入商户地址' }
]);

// 4. 表单校验规则
const formRules = ref({
  merchantName: [
    { required: true, message: '商户名称不能为空', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '联系电话不能为空', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的11位手机号', trigger: 'blur' }
  ]
});

// 5. 接口适配（确保返回total，分页依赖此值）
const api = ref({
  list: async (params) => {
    try {
      const queryParams = { ...params };
      if (queryParams.createTime) {
        queryParams.startTime = `${queryParams.createTime} 00:00:00`;
        queryParams.endTime = `${queryParams.createTime} 23:59:59`;
        delete queryParams.createTime;
      }
      const res = await getMerchantList(queryParams);
      // 必须返回total
      return {
        list: res.data.data?.list || [],
        total: res.data.data?.total || 0 
      };
    } catch (error) {
      console.error("列表查询失败：", error);
      return { list: [], total: 0 };
    }
  },
  add: async (data) => {
    const submitData = { ...data, status: 1 };
    const res = await addMerchant(submitData);
    if (res.data.code !== 200) throw new Error(res.data.msg || "新增商户失败");
    return res.data;
  },
  edit: async (data) => {
    if (!data.id) throw new Error("商户ID不能为空");
    const res = await updateMerchant(data);
    if (res.data.code !== 200) throw new Error(res.data.msg || "编辑商户失败");
    return res.data;
  },
  del: async (id) => {
    if (!id) throw new Error("商户ID不能为空");
    const res = await deleteMerchant(id);
    if (res.data.code !== 200) throw new Error(res.data.msg || "删除商户失败");
    return res.data;
  },
  toggleStatus: async (params) => {
    const res = await toggleMerchantStatus(params);
    if (res.data.code !== 200) throw new Error(res.data.msg || "状态切换失败");
    return res.data;
  }
});

// 状态切换方法
const handleMerchantStatusToggle = async (row) => {
  try {
    const oldStatus = row.status;
    const targetStatus = oldStatus === 1 ? 0 : 1;
    await api.value.toggleStatus({ id: row.id, status: targetStatus });
    row.status = targetStatus;
    ElMessage.success(targetStatus === 1 ? '启用成功' : '禁用成功');
    if (merchantCrudRef.value) merchantCrudRef.value.getlist();
  } catch (error) {
    row.status = oldStatus;
    ElMessage.error(error.message || '状态切换失败');
  }
};
</script>

<style scoped>
/* 修复分页显示：确保BaseCrud的分页不被遮挡 */
:deep(.base-crud) {
  overflow: visible !important;
}

/* 状态按钮样式 */
:deep(.merchant-status-btn) {
  width: 80px !important;
  height: 28px !important;
  font-size: 12px !important;
  margin: 0 auto !important;
}

/* 还原表格与分页的间距 */
:deep(.el-table) {
  margin-bottom: 20px !important;
}
</style>