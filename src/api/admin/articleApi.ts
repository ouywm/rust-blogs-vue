import api from '@/utils/http'
import { BaseResult } from '@/types/axios'
import { ArticleQueryParams, ArticleListResponse, ArticleType } from '../model/articleModel'

export const ArticleService = {
  // 获取文章列表
  getArticleList: (params: ArticleQueryParams) => {
    return api.get<ArticleListResponse>({
      url: '/articles',
      params
    })
  },

  // 获取文章详情
  getArticleDetail: (id: number) => {
    return api.get<BaseResult<ArticleType>>({
      url: `/article/${id}`
    })
  },

  // 创建文章
  createArticle: (data: Partial<ArticleType>) => {
    return api.post<BaseResult>({
      url: '/article',
      params: data
    })
  },

  // 更新文章
  updateArticle: (data: Partial<ArticleType>) => {
    return api.post<BaseResult>({
      url: `/article/${data.id}`,
      params: data
    })
  },

  // 删除文章
  deleteArticle: (id: number) => {
    return api.del<BaseResult>({
      url: `/article/${id}`
    })
  }
}
