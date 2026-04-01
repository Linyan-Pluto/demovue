import request from '@/utils/request'

// 用户列表查询（适配完整Axios响应对象）
export const getAdminUserList = async (params) => {
  // res是完整Axios响应对象，res.data才是接口Result数据
  const axiosRes = await request.get('/admin/user/list', { params })
  const res = axiosRes.data // 提取接口业务数据
  if (res.code === 200) {
    return res.data // 返回BaseCrud需要的{list: [], total: 0}
  } else {
    throw new Error(res.msg || '用户列表查询失败')
  }
}

// 其他接口（add/edit/del等）也按此逻辑修改
export const addAdminUser = async (data) => {
  const axiosRes = await request.post('/admin/user/add', data)
  const res = axiosRes.data
  if (res.code !== 200) {
    throw new Error(res.msg || '新增用户失败')
  }
  return res.data
}

export const updateAdminUser = async (data) => {
  const axiosRes = await request.post('/admin/user/update', data)
  const res = axiosRes.data
  if (res.code !== 200) {
    throw new Error(res.msg || '编辑用户失败')
  }
  return res.data
}

export const deleteAdminUser = async (id) => {
  const axiosRes = await request.post(`/admin/user/delete/${id}`)
  const res = axiosRes.data
  if (res.code !== 200) {
    throw new Error(res.msg || '删除用户失败')
  }
  return res.data
}

export const toggleAdminUserStatus = async (params) => {
  const axiosRes = await request.post('/admin/user/updateStatus', null, { params })
  const res = axiosRes.data
  if (res.code !== 200) {
    throw new Error(res.msg || '用户状态切换失败')
  }
  return res.data
}

// 新增：重置密码接口封装
// @/api/adminUser.js 中，修正resetAdminUserPassword方法
export const resetAdminUserPassword = async (params) => {
  // 关键：第二个参数传null，第三个参数传{ params }，将id拼到URL上
  const axiosRes = await request.post(
    '/admin/user/resetPassword', 
    null, // 请求体为空
    { params: params } // 将params（包含id）作为URL参数传递
  )
  const res = axiosRes.data
  if (res.code !== 200) {
    throw new Error(res.msg || '密码重置失败')
  }
  return res.data
}

// 统一导出
export const adminUserApi = {
  list: getAdminUserList,
  add: addAdminUser,
  edit: updateAdminUser,
  del: deleteAdminUser,
  toggleStatus: toggleAdminUserStatus,
  resetPassword: resetAdminUserPassword // 新增：导出重置密码方法
}