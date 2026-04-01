import request from '@/utils/request'

// 菜品列表查询
export const getAdminDrinkList = (params) => {
  return request.get('/admin/dish/list', { params })
}

// 新增菜品
export const addAdminDrink = (data) => {
  return request.post('/admin/dish/add', data)
}

// 编辑菜品
export const updateAdminDrink = (data) => {
  return request.post('/admin/dish/update', data)
}

// 删除菜品
export const deleteAdminDrink = (id) => {
  return request.post(`/admin/dish/delete/${id}`)
}

// 切换菜品状态
export const toggleAdminDrinkStatus = (params) => {
  return request.post('/admin/dish/updateStatus', {}, { params })
}