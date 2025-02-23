export interface UserWithRoles {
  user_id: number
  username: string
  nickname: string
  email: string
  phone: string
  status: number
  sex: number
  create_time: string
  update_time: string
  last_login: string | null
  avatar: string
  role_ids: number[]
}

export interface UserListResponse {
  list: UserWithRoles[]
  total: number
} 