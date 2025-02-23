import api from '@/utils/http'
import { BaseResult } from '@/types/axios'

export const MenuService = {
  // 获取菜单列表
  getMenuList: () => {
    return api.get<BaseResult>({
      url: '/sys_menu/list'
    })
  },

  // 创建菜单
  createMenu: (data: any) => {
    return api.post<BaseResult>({
      url: `/sys_menu/create`,
      params: data
    })
  },

  // 删除菜单
  deleteMenu: (id: number) => {
    return api.del<BaseResult>({
      url: `/sys_menu/delete/${id}`
    })
  },

  // 更新菜单
  updateMenu: (data: any) => {
    return api.put<BaseResult>({
      url: '/sys_menu/update',
      params: data
    })
  }
}
