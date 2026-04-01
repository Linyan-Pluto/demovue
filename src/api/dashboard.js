import axios from 'axios';

// 1. 统一用Vite代理的前缀
const service = axios.create({
  baseURL: '/api', // 对接Vite代理
  timeout: 5000
});

// 1. 获取仪表盘统计数据
export const getDashboardStats = () => {
  return service.get('/admin/dashboard/stats'); // 原路径去掉/api
};

// 2. 获取图表数据
export const getDashboardChart = (range) => {
  return service.get('/admin/dashboard/chart', { params: { range } });
};

// 3. 获取TOP10销量分店
export const getDashboardTop10 = () => {
  return service.get('/admin/dashboard/top10');
};