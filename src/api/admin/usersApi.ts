import api from '@/utils/http'
import { BaseResult } from '@/types/axios'
import { CreateParam, UpdateParam } from '@/api/model/createModel'
import { UserListResponse } from '@/api/model/userModel'

export const UserService = {
  // 登录接口
  login: (data: { username: string; password: string }) => {
    return api.post<BaseResult>({
      url: '/sys_user/login',
      params: data
    })
  },

  // 获取用户信息
  getUserInfo: () => {
    return api.get<BaseResult>({
      url: '/api/sys_user/info'
    })
  },

  // 获取用户菜单
  getUserMenus: (userId: number) => {
    return api.get<BaseResult>({
      url: `/api/sys_menu/user_routes/${userId}`
    })
  },

  // 获取用户列表
  getUserList: (params?: any) => {
    return api.get<BaseResult<UserListResponse>>({
      url: '/sys_user/list',
      params
    })
  },

  // 创建用户
  createUser: (data: CreateParam) => {
    return api.post<BaseResult>({
      url: '/sys_user/create',
      params: data
    })
  },

  // 更新用户
  updateUser: (data: UpdateParam) => {
    return api.post<BaseResult>({
      url: '/sys_user/update',
      params: data
    })
  },

  // 删除用户
  deleteUser: (userId: number) => {
    return api.del<BaseResult>({
      url: `/sys_user/delete/${userId}`
    })
  },

  // 获取角色列表
  getRoleList: () => {
    return api.get<BaseResult>({
      url: '/sys_role/list'
    })
  },

  // 获取用户角色
  getUserRoles: (userId: number) => {
    return api.get<BaseResult>({
      url: `/sys_user_role/user/${userId}`
    })
  }
}
