<template>
  <div class="article-edit">
    <div>
      <div class="editor-wrap">
        <!-- 文章标题、类型 -->
        <el-row :gutter="10">
          <el-col :span="18">
            <el-input
              v-model.trim="articleName"
              placeholder="请输入文章标题（最多100个字符）"
              maxlength="100"
            />
          </el-col>
          <el-col :span="6">
            <el-select v-model="articleType" placeholder="请选择文章类型" filterable>
              <el-option
                v-for="item in articleTypes"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-col>
        </el-row>

        <!-- 富文本编辑器 -->
        <editor class="el-top" v-model="editorHtml"></editor>

        <div class="form-wrap">
          <h2>发布设置</h2>
          <!-- 图片上传 -->
          <el-form>
            <el-form-item label="封面">
              <div class="el-top upload-container">
                <el-upload
                  class="cover-uploader"
                  :show-file-list="false"
                  :before-upload="beforeUpload"
                  :http-request="customUpload"
                  accept="image/jpeg,image/png,image/gif"
                >
                  <div v-if="!cover" class="upload-placeholder">
                    <el-icon class="upload-icon">
                      <Plus />
                    </el-icon>
                    <div class="upload-text">点击上传封面</div>
                  </div>
                  <img v-else :src="cover" class="cover-image" />
                </el-upload>
                <div class="el-upload__tip">建议尺寸 16:9，jpg/png 格式</div>
              </div>
            </el-form-item>
            <el-form-item label="可见性">
              <el-switch
                v-model="isVisible"
                active-text="公开"
                inactive-text="私密"
              />
            </el-form-item>
            <el-form-item label="置顶">
              <el-switch
                v-model="isTop"
                active-text="置顶"
                inactive-text="普通"
              />
            </el-form-item>
          </el-form>

          <div style="display: flex; justify-content: flex-end">
            <el-button type="primary" @click="submit" style="width: 100px">
              {{ pageMode === PageModeEnum.Edit ? '保存' : '发布' }}
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- <div class="outline-wrap">
        <div class="item" v-for="(item, index) in outlineList" :key="index">
          <p :class="`level${item.level}`">{{ item.text }}</p>
        </div>
      </div> -->
  </div>
</template>

<script setup lang="ts">
  import { Plus } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import { useUserStore } from '@/store/modules/user'
  import EmojiText from '@/utils/emojo'
  import { PageModeEnum } from '@/enums/formEnum'
  import { ArticleCategoryService } from '@/api/admin/articleCategoryApi'
  import { ArticleService } from '@/api/admin/articleApi'

  const route = useRoute()
  const router = useRouter()

  const userStore = useUserStore()
  const access_token = userStore.info?.access_token || ''

  // 修改上传配置
  const uploadConfig = {
    url: '/api/sys_oss/upload',
    headers: { 
      Authorization: `${access_token}`
    },
    data: {}, // 额外的上传数据
    name: 'file', // 文件字段名
    withCredentials: true // 允许发送 cookie
  }

  let pageMode: PageModeEnum = PageModeEnum.Add // 页面类型 新增 ｜ 编辑
  const articleName = ref('') // 文章标题
  const articleType = ref() // 文章类型
  const articleTypes = ref() // 类型列表
  const editorHtml = ref('') // 编辑器内容
  const createDate = ref('') // 创建时间
  const cover = ref('') // 图片
  const isVisible = ref(true)  // 默认公开
  const isTop = ref(false)     // 默认不置顶
  // const outlineList = ref()

  onMounted(() => {
    scrollToTop()
    getArticleTypes()
    initPageMode()
  })

  // 初始化页面类型 新增 ｜ 编辑
  const initPageMode = () => {
    const { id } = route.query
    pageMode = id ? PageModeEnum.Edit : PageModeEnum.Add
    if (pageMode === PageModeEnum.Edit && id) {
      initEditArticle(Number(id))
    } else {
      initAddArticle()
    }
  }

  // 初始化编辑文章的逻辑
  const initEditArticle = (id: number) => {
    articleId = id
    getArticleDetail()
  }

  // 初始化新增文章逻辑
  const initAddArticle = () => {
    createDate.value = formDate(useNow().value)
  }

  // 获取文章类型
  const getArticleTypes = async () => {
    try {
      const res = await ArticleCategoryService.getArticleList()
      if (res.code === 200) {
        articleTypes.value = res.data
      }
    } catch (error) {
      console.error('获取文章类型失败', error)
    }
  }

  // 获取文章详情内容
  let articleId: number
  const getArticleDetail = async () => {
    try {
      const res = await ArticleService.getArticleDetail(articleId)
      if (res.code === 200) {
        const { 
          title, 
          category_id, 
          created_time, 
          home_img, 
          html_content,
          is_visible,
          is_top 
        } = res.data

        articleName.value = title
        articleType.value = category_id
        editorHtml.value = html_content
        cover.value = home_img
        createDate.value = formDate(created_time)
        isVisible.value = is_visible === 1
        isTop.value = is_top === 1
      } else {
        ElMessage.error(res.message || '获取文章详情失败')
      }
    } catch (error) {
      console.error('获取文章详情失败:', error)
      ElMessage.error('获取文章详情失败')
    }
  }

  // const getOutline = (content: string) => {
  //   const regex = /<h([1-3])>(.*?)<\/h\1>/g
  //   const headings = []
  //   let match

  //   while ((match = regex.exec(content)) !== null) {
  //     headings.push({ level: match[1], text: match[2] })
  //   }
  //   outlineList.value = headings
  // }

  // 提交
  const submit = () => {
    if (pageMode === PageModeEnum.Edit) {
      editArticle()
    } else {
      addArticle()
    }
  }

  // 格式化日期
  const formDate = (date: string | Date): string => {
    return useDateFormat(date, 'YYYY-MM-DD').value
  }

  // 验证输入
  const validateArticle = () => {
    if (!articleName.value) {
      ElMessage.error(`请输入文章标题`)
      return false
    }

    if (!articleType.value) {
      ElMessage.error(`请选择文章类型`)
      return false
    }

    if (editorHtml.value === '<p><br></p>') {
      ElMessage.error(`请输入文章内容`)
      return false
    }

    if (!cover.value) {
      ElMessage.error(`请上传图片`)
      return false
    }

    return true
  }

  // 添加文章
  const addArticle = async () => {
    try {
      if (!validateArticle()) return

      editorHtml.value = delCodeTrim(editorHtml.value)

      const params = {
        title: articleName.value,
        html_content: editorHtml.value,
        home_img: cover.value,
        category_id: articleType.value,
        brief: editorHtml.value.substring(0, 200), // 取前200字作为简介
        is_visible: isVisible.value,
        is_top: isTop.value
      }

      const res = await ArticleService.createArticle(params)
      if (res.code === 200) {
        ElMessage.success(`发布成功 ${EmojiText[200]}`)
        goBack()
      } else {
        ElMessage.error(res.message || '发布失败')
      }
    } catch (err) {
      console.error(err)
      ElMessage.error('发布失败')
    }
  }

  // 编辑文章
  const editArticle = async () => {
    try {
      if (!validateArticle()) return

      editorHtml.value = delCodeTrim(editorHtml.value)

      const params = {
        id: articleId,
        title: articleName.value,
        html_content: editorHtml.value,
        home_img: cover.value,
        category_id: articleType.value,
        brief: editorHtml.value.substring(0, 200),
        is_visible: isVisible.value,
        is_top: isTop.value
      }

      const res = await ArticleService.updateArticle(params)
      if (res.code === 200) {
        ElMessage.success(`修改成功 ${EmojiText[200]}`)
        goBack()
      } else {
        ElMessage.error(res.message || '修改失败')
      }
    } catch (err) {
      console.error(err)
      ElMessage.error('修改失败')
    }
  }

  const delCodeTrim = (content: string): string => {
    return content.replace(/(\s*)<\/code>/g, '</code>')
  }

  // 修改上传组件的处理方法
  const customUpload = async (options: any) => {
    try {
      const formData = new FormData()
      formData.append('file', options.file)

      const response = await fetch(uploadConfig.url, {
        method: 'POST',
        headers: {
          Authorization: access_token
        },
        body: formData
      })

      const result = await response.json()
      
      if (result.code === 200) {
        cover.value = result.data
        ElMessage.success('图片上传成功')
      } else {
        throw new Error(result.message || '上传失败')
      }
    } catch (error) {
      console.error('上传失败:', error)
      ElMessage.error('图片上传失败')
    }
  }

  // 返回上一页
  const goBack = () => {
    setTimeout(() => {
      router.go(-1)
    }, 800)
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0 })
  }

  // 添加上传前的校验
  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/')
    const isLt2M = file.size / 1024 / 1024 < 2

    if (!isImage) {
      ElMessage.error('只能上传图片文件!')
      return false
    }
    if (!isLt2M) {
      ElMessage.error('图片大小不能超过 2MB!')
      return false
    }
    return true
  }
</script>

<style lang="scss" scoped>
  .article-edit {
    .editor-wrap {
      max-width: 1000px;
      margin: 20px auto;

      .el-top {
        margin-top: 10px;
      }

      .form-wrap {
        padding: 20px;
        margin-top: 20px;
        background-color: var(--art-main-bg-color);
        border: 1px solid var(--art-border-color);
        border-radius: calc(var(--custom-radius) / 2 + 2px) !important;

        h2 {
          margin-bottom: 20px;
          font-size: 20px;
          font-weight: 500;
        }
      }
    }

    .outline-wrap {
      box-sizing: border-box;
      width: 280px;
      padding: 20px;
      border: 1px solid #e3e3e3;
      border-radius: 8px;

      .item {
        p {
          height: 30px;
          font-size: 13px;
          line-height: 30px;
          cursor: pointer;
        }

        .level3 {
          padding-left: 10px;
        }
      }
    }

    .upload-container {
      .cover-uploader {
        position: relative;
        overflow: hidden;
        cursor: pointer;
        border-radius: 6px;
        transition: var(--el-transition-duration);

        &:hover {
          border-color: var(--el-color-primary);
        }

        .upload-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 260px;
          height: 160px;
          border: 1px dashed #d9d9d9;
          border-radius: 6px;

          .upload-icon {
            font-size: 28px;
            color: #8c939d;
          }

          .upload-text {
            margin-top: 8px;
            font-size: 14px;
            color: #8c939d;
          }
        }

        .cover-image {
          display: block;
          width: 260px;
          height: 160px;
          object-fit: cover;
        }
      }

      .el-upload__tip {
        margin-top: 8px;
        font-size: 12px;
        color: #666;
      }
    }
  }
</style>
