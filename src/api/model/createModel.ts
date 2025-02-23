// 新增用户参数
export interface CreateParam {
  username: string
  nickname: string
  phone: string
  email: string
  sex: number
  status: number
  role_ids: number[]
}

// 更新用户参数
export interface UpdateParam {
  user_id: number
  nickname: string
  phone: string
  email: string
  sex: number
  status: number
  role_ids: number[]
}
