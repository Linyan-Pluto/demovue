<template>
  <!-- 绑定ref，用于调用BaseCrud内部的刷新方法 -->
  <base-crud
    ref="baseCrudRef"
    :search-config="searchConfig"
    :table-columns="tableColumns"
    :form-items="formItems"
    :form-rules="formRules"
    :api="api"
    :show-operate-column="true"
  >
    <!-- 状态列插槽 -->
    <template #status-switch="slotProps">
      <el-button
        size="small"
        :type="slotProps.row.isOnSale === 1 ? 'danger' : 'success'"
        @click="handleDrinkStatusToggle(slotProps.row)"
        class="status-btn"
      >
        <!-- 按钮文字随当前状态切换：上架→显示“下架”，下架→显示“上架” -->
        {{ slotProps.row.isOnSale === 1 ? '下架' : '上架' }}
      </el-button>
    </template>
  </base-crud>
</template>

<script setup>
import { ref } from 'vue';
import BaseCrud from '@/components/BaseCrud.vue';
import { ElMessage } from 'element-plus';
import { 
  getAdminDrinkList, 
  addAdminDrink, 
  updateAdminDrink, 
  deleteAdminDrink, 
  toggleAdminDrinkStatus
} from '@/api/adminDish';

// 绑定BaseCrud的ref，用于调用内部getlist方法刷新列表
const baseCrudRef = ref(null);

// 1. 搜索栏配置
const searchConfig = ref([
  { label: '饮品名称', prop: 'drinkName', type: 'input', placeholder: '请输入饮品名称' },
  { label: '饮品介绍', prop: 'drinkIntro', type: 'input', placeholder: '请输入饮品介绍关键词' },
  { label: '饮品分类', prop: 'categoryId', type: 'select', options: [
    { label: '奶茶类', value: 1 },
    { label: '咖啡类', value: 2 },
    { label: '果汁类', value: 3 },
    { label: '茶类', value: 4 },
    { label: '小吃类', value: 5 }
  ], placeholder: '请选择饮品分类' },
  { label: '上架状态', prop: 'isOnSale', type: 'select', options: [
    { label: '上架', value: 1 },
    { label: '下架', value: 0 }
  ], placeholder: '请选择上架状态' },
  { label: '创建时间', prop: 'createTime', type: 'date', placeholder: '请选择创建日期' }
]);

// 2. 表格列配置（上架状态列添加slot，分类保留formatter）
const tableColumns = ref([
  { label: 'ID', prop: 'id', width: '80px', align: 'center' },
  { label: '饮品名称', prop: 'drinkName', width: '200px' },
  { 
    label: '饮品分类', 
    prop: 'categoryId', 
    width: '120px', 
    align: 'center',
    formatter: (row) => {
      const categoryMap = {
        1: '奶茶类',
        2: '咖啡类',
        3: '果汁类',
        4: '茶类',
        5: '小吃类'
      };
      return categoryMap[row.categoryId] || '未知分类';
    }
  },
  { label: '饮品价格', prop: 'price', width: '100px', align: 'center', formatter: (row) => `¥${row.price.toFixed(2)}` },
  { label: '库存数量', prop: 'stock', width: '100px', align: 'center' },
  { label: '饮品介绍', prop: 'drinkIntro', minWidth: '250px' },
  { 
    label: '上架状态', 
    prop: 'isOnSale', 
    width: '100px', // 适配按钮宽度
    align: 'center',
    slot: 'status-switch' // 绑定插槽，渲染自定义切换按钮
  }
]);

// 3. 弹窗表单配置
const formItems = ref([
  { label: 'ID', prop: 'id', type: 'input', hidden: true },
  { label: '饮品名称', prop: 'drinkName', type: 'input', placeholder: '请输入饮品名称' },
  { label: '饮品分类', prop: 'categoryId', type: 'select', options: [
    { label: '奶茶类', value: 1 },
    { label: '咖啡类', value: 2 },
    { label: '果汁类', value: 3 },
    { label: '茶类', value: 4 },
    { label: '小吃类', value: 5 }
  ], placeholder: '请选择饮品分类' },
  { label: '饮品价格', prop: 'price', type: 'input', placeholder: '请输入饮品价格', attrs: { type: 'number', step: '0.01' } },
  { label: '库存数量', prop: 'stock', type: 'input', placeholder: '请输入库存数量', attrs: { type: 'number', min: '1' } },
  { 
     label: '饮品介绍', 
     prop: 'drinkIntro', 
     type: 'textarea', 
     placeholder: '请输入饮品介绍（最多200字）',
     attrs: { 
        rows: 3,
        style: 'width: 100%'
     } 
  }
]);

// 4. 表单校验规则
const formRules = ref({
  drinkName: [
    { required: true, message: '饮品名称不能为空', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '饮品价格不能为空', trigger: 'blur' },
    { pattern: /^([1-9]\d*(\.\d{1,2})?|0\.\d{1,2})$/, message: '请输入有效的金额格式', trigger: 'blur' }
  ],
  stock: [
    { required: true, message: '库存数量不能为空', trigger: 'blur' },
    { pattern: /^[1-9]\d*$/, message: '请输入有效的正整数库存', trigger: 'blur' }
  ]
});

// 5. 接口适配
const api = ref({
  list: async (params) => {
    try {
      const queryParams = { ...params };
      // 日期转时间范围
      if (queryParams.createTime) {
        queryParams.startTime = `${queryParams.createTime} 00:00:00`;
        queryParams.endTime = `${queryParams.createTime} 23:59:59`;
        delete queryParams.createTime;
      }
      const res = await getAdminDrinkList(queryParams);
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
    const submitData = { 
      ...data, 
      isOnSale: 1, // 新增默认上架
      price: Number(data.price),
      stock: Number(data.stock)
    };
    const res = await addAdminDrink(submitData);
    if (res.data.code !== 200) {
      throw new Error(res.data.msg || "新增饮品失败");
    }
    return res.data;
  },
  edit: async (data) => {
    if (!data.id) throw new Error("饮品ID不能为空");
    const submitData = {
      ...data,
      price: Number(data.price),
      stock: Number(data.stock)
    };
    const res = await updateAdminDrink(submitData);
    if (res.data.code !== 200) {
      throw new Error(res.data.msg || "编辑饮品失败");
    }
    return res.data;
  },
  del: async (id) => {
    if (!id) throw new Error("饮品ID不能为空");
    const res = await deleteAdminDrink(id);
    if (res.data.code !== 200) {
      throw new Error(res.data.msg || "删除饮品失败");
    }
    return res.data;
  },
  toggleStatus: async (params) => {
    // 接收id和isOnSale参数，直接传递给后端
    const res = await toggleAdminDrinkStatus(params);
    if (res.data.code !== 200) {
      throw new Error(res.data.msg || "状态切换失败");
    }
    return res.data;
  }
});

// 修复状态切换方法：无searchForm引用，调用BaseCrud刷新，本地临时更新状态提升体验
const handleDrinkStatusToggle = async (row) => {
  try {
    // 保存原有状态，用于接口失败时回滚
    const oldStatus = row.isOnSale;
    // 计算目标状态
    const targetStatus = oldStatus === 1 ? 0 : 1;

    // 调用后端接口切换状态
    await api.value.toggleStatus({
      id: row.id,
      isOnSale: targetStatus
    });

    // 本地临时更新状态，无需等待列表刷新，体验更流畅
    row.isOnSale = targetStatus;
    // 提示成功信息
    ElMessage.success(targetStatus === 1 ? '上架成功' : '下架成功');

    // 调用BaseCrud内部的getlist方法，刷新列表确保数据与后端同步
    if (baseCrudRef.value) {
      baseCrudRef.value.getlist();
    }
  } catch (error) {
    // 接口失败：回滚本地状态，避免页面显示异常
    row.isOnSale = oldStatus;
    ElMessage.error(error.message || '状态切换失败');
    console.error("状态切换失败：", error);
  }
};
</script>

<style scoped>
/* 样式补充，确保按钮排版整齐 */
:deep(.el-table) {
  margin-top: 10px;
}

:deep(.el-table .cell) {
  white-space: normal !important;
  word-break: break-all;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* 最多显示2行，超出隐藏 */
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

:deep(.el-button) {
  justify-content: center !important;
  align-items: center !important;
}

/* 状态按钮样式优化，与操作按钮保持一致 */
:deep(.status-btn) {
  width: 80px !important;
  height: 28px !important;
  font-size: 12px !important;
}
</style>