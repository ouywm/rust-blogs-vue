import api from '@/utils/http'
import { BaseResult } from '@/types/axios'
import { CreateRoleDTO, UpdateRoleDTO, RoleListResponse } from '@/api/model/roleModel'
import { MenuListType } from '@/types/menuModel'

export const RoleService = {
  // 获取角色列表
  getRoleList: (params?: any) => {
    return api.get<BaseResult<RoleListResponse>>({
      url: '/sys_role/list',
      params
    })
  },

  // 创建角色
  createRole: (data: CreateRoleDTO) => {
    return api.post<BaseResult>({
      url: '/sys_role/create',
      params: data
    })
  },

  // 更新角色
  updateRole: (data: UpdateRoleDTO) => {
    return api.post<BaseResult>({
      url: '/sys_role/update',
      params: data
    })
  },

  // 删除角色
  deleteRole: (roleId: number) => {
    return api.del<BaseResult>({
      url: `/sys_role/delete/${roleId}`
    })
  },

  // 获取角色的菜单权限
  getRoleMenus: (roleId: number) => {
    return api.get<
      BaseResult<{
        menus: MenuListType[]
        checkedKeys: number[]
      }>
    >({
      url: `/sys_menu/role/${roleId}/permissions`
    })
  },

  // 更新角色的菜单权限
  updateRoleMenus: (roleId: number, menuIds: number[]) => {
    return api.post<BaseResult>({
      url: `/sys_role/menus/${roleId}`,
      params: menuIds
    })
  }
}
