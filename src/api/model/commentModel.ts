export interface CommentType {
  id: number
  author: string
  content: string
  timestamp: string
  replies: CommentType[]
}

export interface CreateCommentParams {
  post_id: number
  content: string
  author: string
  parent_id?: number
}

export interface CommentListResponse {
  code: number
  message: string
  data: CommentType[]
} 