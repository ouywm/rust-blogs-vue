import api from '@/utils/http'
import { BaseResult } from '@/types/axios'
import { ArticleType, ArticleCategoryType } from '../model/articleModel'

export const ArticleCategoryService = {
  // 获取分类列表
  getArticleList: () => {
    return api.get<BaseResult<ArticleCategoryType[]>>({
      url: '/categories'
    })
  },

  // 创建分类
  createCategory: (data: Partial<ArticleCategoryType>) => {
    return api.post<BaseResult>({
      url: '/category',
      params: data
    })
  },

  // 更新分类
  updateCategory: (data: Partial<ArticleCategoryType>) => {
    return api.post<BaseResult>({
      url: `/category/${data.id}`,
      params: data
    })
  },

  // 删除分类
  deleteCategory: (id: number) => {
    return api.del<BaseResult>({
      url: `/category/${id}`
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
