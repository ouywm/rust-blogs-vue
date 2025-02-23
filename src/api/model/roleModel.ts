export interface RoleInfo {
  role_id: number
  role_name: string
  role_code: string
  role_desc: string
  status: number
  create_time: string
  update_time: string
}

export interface CreateRoleDTO {
  role_name: string
  role_code: string
  role_desc: string
  status: number
  menu_ids: number[]
}

export interface UpdateRoleDTO extends CreateRoleDTO {
  role_id: number
}

export interface RoleListResponse {
  list: RoleInfo[]
  total: number
} 