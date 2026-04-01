import request from '@/utils/request'

// 登录接口（适配后端login方法）
export const userLogin = (data) => {
  return request.post('/auth/login', data)
}

// 注册接口（适配后端register方法）
export const userRegister = (data) => {
  return request.post('/auth/register', data)
}


// 用户列表查询（分页+条件查询）
export function getUserList(params) {
  return request({
    url: '/admin/user/list',
    method: 'get',
    params
  })
}

// 新增用户
export function addUser(data) {
  return request({
    url: '/admin/user/add',
    method: 'post',
    data
  })
}

// 编辑用户
export function updateUser(data) {
  return request({
    url: '/admin/user/update',
    method: 'post',
    data
  })
}

// 删除用户
export function deleteUser(id) {
  return request({
    url: `/admin/user/delete/${id}`,
    method: 'post'
  })
}

// 切换用户状态
export function toggleUserStatus(params) {
  return request({
    url: '/admin/user/toggleStatus',
    method: 'post',
    params
  })
}