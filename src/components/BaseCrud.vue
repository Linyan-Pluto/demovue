<template>
  <div class="base-crud">
    <!-- 1. 搜索栏 + 添加按钮 -->
    <div class="search-wrapper">
      <el-form :model="searchForm" inline class="search-form" @submit.prevent="handleSearch">
        <el-form-item
          v-for="item in searchConfig"
          :key="item.prop"
          :label="item.label"
        >
          <!-- 输入框 -->
          <el-input
            v-if="item.type === 'input'"
            v-model="searchForm[item.prop]"
            :placeholder="item.placeholder || `请输入${item.label}`"
            clearable
            v-bind="item.attrs"
          />
          <!-- 下拉选择（强制宽度+修复选中文字显示） -->
          <el-select
            v-else-if="item.type === 'select'"
            v-model="searchForm[item.prop]"
            :placeholder="item.placeholder || `请选择${item.label}`"
            clearable
            class="search-select"
            style="width: 120px !important;"
            v-bind="item.attrs"
          >
            <el-option
              v-for="opt in item.options"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
          <!-- 日期选择器 -->
          <el-date-picker
            v-else-if="item.type === 'date'"
            v-model="searchForm[item.prop]"
            type="date"
            :placeholder="item.placeholder || `请选择${item.label}`"
            clearable
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="(val) => {
              searchForm[item.prop] = val;
              console.log(`日期${item.prop}：`, val);
            }"
            v-bind="item.attrs"
          />
        </el-form-item>
      </el-form>

      <!-- 查询/重置按钮组（强制居中） -->
      <div class="search-btn-group">
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset" style="margin-left: 8px;">重置</el-button>
      </div>
    </div>

    <!-- 新增按钮 -->
    <el-button
      type="primary"
      icon="el-icon-plus"
      class="add-btn"
      @click="handleAdd"
    >新增</el-button>

    <!-- 2. 数据表格（修复formatter+支持插槽+操作列加宽+Flex布局） -->
    <el-table
      :data="tableData"
      border
      stripe
      v-loading="loading"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        v-for="col in tableColumns"
        :key="col.prop"
        :prop="col.prop"
        :label="col.label"
        :width="col.width"
        :fixed="col.fixed"
        :align="col.align || 'left'"
      >
        <template #default="scope">
          <!-- 1. 优先使用插槽渲染（个性化内容：状态按钮） -->
          <template v-if="col.slot">
            <slot :name="col.slot" :row="scope.row"></slot>
          </template>
          <!-- 2. 其次使用原有render函数渲染 -->
          <template v-else-if="col.render">
            <component :is="col.render" :row="scope.row" />
          </template>
          <!-- 3. 默认渲染（新增formatter处理，修复分类显示数字问题） -->
          <template v-else>
            {{ col.formatter ? col.formatter(scope.row) : scope.row[col.prop] }}
          </template>
        </template>
      </el-table-column>
      
      <!-- 默认操作列：1. 加宽到200px（解决宽度不足） 2. 包Flex容器强制横向排列 -->
      <el-table-column 
        label="操作" 
        width="200px" 
        align="center"
        v-if="showOperateColumn"
      >
        <template #default="scope">
          <!-- 关键：添加Flex容器，彻底避免按钮换行 -->
          <div class="op-btn-container">
            <el-button
              type="primary"
              size="small"
              icon="el-icon-edit"
              @click="handleEdit(scope.row)"
              class="op-btn"
            >编辑</el-button>
            <el-button
              type="danger"
              size="small"
              icon="el-icon-delete"
              @click="handleDelete(scope.row)"
              class="op-btn"
            >删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 3. 分页 -->
    <el-pagination
     :current-page="pagination.pageNum" 
     @update:current-page="pagination.pageNum = $event"
     :page-size="pagination.pageSize"   
     @update:page-size="pagination.pageSize = $event"
     :total="pagination.total"
     layout="total, sizes, prev, pager, next, jumper"
     @size-change="handleSizeChange"
     @current-change="handleCurrentChange"
     style="margin-top: 20px; text-align: right;"
    />

    <!-- 4. 弹窗表单（已新增textarea渲染+attrs绑定） -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑' : '新增'"
      width="700px"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item
          v-for="item in filteredFormItems"
          :key="item.prop"
          :label="item.label"
          :prop="item.prop"
        >
          <!-- 输入框（支持attrs绑定） -->
          <el-input
            v-if="item.type === 'input'"
            v-model="formData[item.prop]"
            :placeholder="item.placeholder || `请输入${item.label}`"
            v-bind="item.attrs"
          />
          <!-- 下拉选择（支持attrs绑定） -->
          <el-select
            v-else-if="item.type === 'select'"
            v-model="formData[item.prop]"
            :placeholder="item.placeholder || `请选择${item.label}`"
            v-bind="item.attrs"
          >
            <el-option
              v-for="opt in item.options"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
          <!-- 多行文本框（新增，支持attrs绑定） -->
          <el-input
            v-else-if="item.type === 'textarea'"
            type="textarea"
            v-model="formData[item.prop]"
            :placeholder="item.placeholder || `请输入${item.label}`"
            v-bind="item.attrs"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// 接收父组件参数（包含showOperateColumn，默认显示操作列）
const props = defineProps({
  searchConfig: { type: Array, required: true, default: () => [] },
  tableColumns: { type: Array, required: true, default: () => [] },
  formItems: { type: Array, required: true, default: () => [] },
  formRules: { type: Object, required: true, default: () => ({}) },
  api: { type: Object, required: true, default: () => ({}) },
  showOperateColumn: { type: Boolean, default: true }
});

// 响应式数据
const loading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref(null);

// 初始化搜索表单（修复select类型不匹配）
const searchForm = reactive({});
props.searchConfig.forEach(item => {
  // 针对数字类型的select选项，初始化为null（匹配value类型）
  if (item.type === 'select' && item.options?.some(opt => typeof opt.value === 'number')) {
    searchForm[item.prop] = null;
  } else {
    searchForm[item.prop] = item.type === 'date' ? null : '';
  }
});

// 分页参数
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
});

// 表格数据
const tableData = ref([]);

// 表单数据（包含隐藏字段）
const formData = reactive({});
props.formItems.forEach(item => {
  formData[item.prop] = item.hidden ? null : '';
});

// 计算属性：过滤隐藏表单项
const filteredFormItems = computed(() => {
  return props.formItems.filter(item => !item.hidden);
});

// 初始化查询
onMounted(() => {
  getlist();
});

// 列表查询
const getlist = async () => {
  loading.value = true;
  try {
    const searchParams = {};
    props.searchConfig.forEach(item => {
      const val = searchForm[item.prop];
      if (val !== null && val !== '' && val !== undefined) {
        searchParams[item.prop] = val;
      }
    });
    const params = {
      ...searchParams,
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize
    };
    const res = await props.api.list(params);
    tableData.value = res.list || [];
    pagination.total = res.total || 0;
  } catch (err) {
    ElMessage.error(`查询失败：${err.message || '未知错误'}`);
    console.error('查询异常：', err);
  } finally {
    loading.value = false;
  }
};

// 搜索/重置/分页方法
const handleSearch = () => {
  pagination.pageNum = 1;
  getlist();
};
const handleReset = () => {
  props.searchConfig.forEach(item => {
    searchForm[item.prop] = item.type === 'date' ? null : '';
  });
  pagination.pageNum = 1;
  getlist();
};
const handleSizeChange = (val) => {
  pagination.pageSize = val;
  getlist();
};
const handleCurrentChange = (val) => {
  pagination.pageNum = val;
  getlist();
};

// 新增/编辑/删除（状态切换已移到插槽，此处保留原有逻辑）
const handleAdd = () => {
  props.formItems.forEach(item => {
    formData[item.prop] = item.hidden ? null : '';
  });
  isEdit.value = false;
  dialogVisible.value = true;
};
const handleEdit = (row) => {
  props.formItems.forEach(item => {
    formData[item.prop] = row[item.prop] !== undefined ? row[item.prop] : (item.hidden ? null : '');
  });
  formData.id = row.id;
  isEdit.value = true;
  dialogVisible.value = true;
};
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定删除该数据？', '警告', { type: 'warning' });
    await props.api.del(row.id);
    ElMessage.success('删除成功');
    getlist();
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error(`删除失败：${err.message || '未知错误'}`);
    } else {
      ElMessage.info('已取消删除');
    }
  }
};

const handleToggleStatus = async (row) => {
  try {
    await props.api.toggleStatus(row);
    ElMessage.success(row.status === 1 ? '禁用成功' : '启用成功');
    getlist();
  } catch (err) {
    ElMessage.error(`状态切换失败：${err.message || '未知错误'}`);
    console.error('状态切换异常：', err);
  }
};

// 弹窗确认
const handleConfirm = async () => {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    if (isEdit.value) {
      await props.api.edit(formData);
      ElMessage.success('编辑成功');
    } else {
      await props.api.add(formData);
      ElMessage.success('新增成功');
    }
    dialogVisible.value = false;
    getlist();
  } catch (err) {
    if (err.name !== 'ValidationError') {
      ElMessage.error(`${isEdit.value ? '编辑' : '新增'}失败：${err.message || '未知错误'}`);
    }
  }
};

// 多选事件
const handleSelectionChange = (val) => {};

defineExpose({
  getlist
});
</script>

<style scoped>
.base-crud {
  padding: 20px;
}

/* 搜索栏：强制flex列布局+居中 */
.search-wrapper {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  width: 100% !important;
  margin-bottom: 20px;
}

.search-form {
  width: 100% !important;
  margin-bottom: 10px !important;
}

/* 查询/重置按钮：强制居中 */
.search-btn-group {
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  width: 100% !important;
}

/* 新增按钮：文字居中 */
.add-btn {
  margin-bottom: 20px;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
}

/* 下拉框选中文字：强制显示 */
:deep(.search-select .el-select__selection-item) {
  color: #333 !important;
  line-height: 32px !important;
  display: block !important;
}

/* 全局按钮：强制文字居中（最高优先级） */
:deep(.el-button) {
  display: inline-flex !important;
  justify-content: center !important;
  align-items: center !important;
  text-align: center !important;
  padding: 0 15px !important;
}

:deep(.op-btn-container) {
  display: flex !important;
  gap: 10px !important; 
  justify-content: center !important; /* 水平居中 */
  align-items: center !important; /* 垂直居中 */
  width: 100% !important;
  white-space: nowrap !important; /* 禁止换行 */
}

/* 操作列按钮：固定宽度，取消原有margin */
:deep(.op-btn-container .op-btn) {
  width: 80px !important; 
  height: 28px !important;
  padding: 0 8px !important;
  font-size: 12px !important;
  margin: 0 !important; /* 取消原有margin，用gap控制间距 */
}

/* 状态列按钮：居中显示，固定宽度 */
:deep(.el-table .status-btn) {
  margin: 0 auto !important;
  width: 80px !important;
  height: 28px !important;
  font-size: 12px !important;
}

:deep(.el-table) {
  margin-top: 10px;
  width: 100% !important;
}

:deep(.el-table-cell) {
  padding: 12px 0 !important;
  white-space: nowrap !important; /* 禁止单元格内容换行 */
}
</style>