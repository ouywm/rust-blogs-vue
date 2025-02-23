import api from '@/utils/http'
import { BaseResult } from '@/types/axios'
import { CommentType, CreateCommentParams, CommentListResponse } from '../model/commentModel'

export const CommentService = {
  // 获取文章评论列表
  getArticleComments: (articleId: number) => {
    return api.get<CommentListResponse>({
      url: `/article/${articleId}/comments`
    })
  },

  // 创建评论
  createComment: (data: CreateCommentParams) => {
    return api.post<BaseResult>({
      url: '/comment',
      params: data
    })
  },

  // 删除评论
  deleteComment: (commentId: number) => {
    return api.del<BaseResult>({
      url: `/comment/${commentId}`
    })
  },

  // 更新评论
  updateComment: (data: { comment_id: number; content: string }) => {
    return api.post<BaseResult>({
      url: '/comment/update',
      params: data
    })
  }
}
