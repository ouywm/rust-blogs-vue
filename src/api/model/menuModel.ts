// 添加创建菜单的数据类型
export interface CreateMenuDTO {
  meta: {
    title: string
    menuType: 'M' | 'C' | 'F'  // M:目录 C:菜单 F:按钮
    icon?: string
    permission?: string
    orderNum: number
    status: number
  }
  path?: string
  component?: string
  parentId?: number
}
