import axios from 'axios';

// 初始化axios请求实例
const request = axios.create({
  baseURL: '/api', // 匹配后端Controller的/api前缀
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器（可选，统一处理响应）
request.interceptors.response.use(
  (res) => {
    return res; // 不提前解析，交给父组件处理
  },
  (error) => {
    console.error('接口请求失败：', error);
    return Promise.reject(error);
  }
);

// 1. 商户列表查询
export const getMerchantList = (params) => {
  return request.get('/admin/merchant/list', { params });
};

// 2. 新增商户
export const addMerchant = (data) => {
  return request.post('/admin/merchant/add', data);
};

// 3. 编辑商户
export const updateMerchant = (data) => {
  return request.post('/admin/merchant/update', data);
};

// 4. 删除商户
export const deleteMerchant = (id) => {
  return request.post(`/admin/merchant/delete/${id}`);
};

// 5. 状态切换
export const toggleMerchantStatus = (params) => {
  // params格式：{ id: 1, status: 0 }（接收id和status两个参数）
  return request.post('/admin/merchant/updateStatus', {}, { params });
};