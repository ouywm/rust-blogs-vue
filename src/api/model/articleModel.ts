export interface ArticleType {
  id: number
  category_id: number
  title: string
  html_content: string
  home_img: string
  brief: string
  view_count: number
  created_time: string
  updated_time: string
  type_name: string
  is_visible: boolean
  is_top: boolean
}

export interface ArticleQueryParams {
  page?: number
  size?: number
  category_id?: number
  title?: string
  year?: string
}

export interface ArticleListResponse {
  current_page: number
  page_size: number
  last_page: number
  total: string
  message: string
  code: number
  data: ArticleType[]
}

export interface ArticleCategoryType {
  id: number // 文章分类id
  name: string // 文章分类名称
  icon: string // 文章分类图标
  icon_class: string // 添加这个字段
  count: number // 文章分类下的文章数量
}
