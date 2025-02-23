<template>
  <div class="article-detail">
    <!-- 骨架屏 -->
    <el-skeleton :loading="loading" animated>
      <template #template>
        <div class="skeleton-content">
          <!-- 标题骨架 -->
          <el-skeleton-item variant="h1" style="width: 60%; height: 40px; margin-bottom: 20px" />

          <!-- 内容骨架 -->
          <div class="skeleton-body">
            <el-skeleton-item
              variant="text"
              style="width: 100%; height: 20px; margin-bottom: 15px"
              v-for="i in 10"
              :key="i"
            />
            <el-skeleton-item
              variant="p"
              style="width: 80%; height: 20px; margin-bottom: 15px"
              v-for="i in 5"
              :key="i + 10"
            />
          </div>
        </div>
      </template>

      <!-- 实际内容 -->
      <template #default>
        <div class="content">
          <h1>{{ articleTitle }}</h1>
          <div class="markdown-body" v-highlight v-html="articleHtml"></div>
          <el-divider />
          <div class="comment-module">
            <form @submit.prevent="handleCommentSubmit">
              <div>
                <textarea
                  v-model="newComment.content"
                  placeholder="写下你的评论..."
                  required
                ></textarea>
                <button class="btn" type="submit">发布</button>
              </div>
            </form>
            <ul>
              <div class="comment-header">评论 {{ commentList.length }}</div>
              <CommentItem
                class="comment-item"
                v-for="comment in commentList.slice().reverse()"
                :key="comment.id"
                :comment="comment"
                :show-reply-form="showReplyForm"
                @toggle-reply="toggleReply"
                @add-reply="handleReplySubmit"
                @edit-comment="handleEditComment"
                @delete-comment="handleDeleteComment"
              />
            </ul>
          </div>
        </div>
      </template>
    </el-skeleton>

    <BackToTop />
  </div>
</template>

<script setup lang="ts">
  import '@/assets/styles/markdown.scss'
  import '@/assets/styles/one-dark-pro.scss'
  import BackToTop from '@comps/Widgets/BackToTop.vue'
  import { ArticleService } from '@/api/admin/articleApi'
  import { CommentService } from '@/api/admin/commentApi'
  import type { CommentType } from '@/api/model/commentModel'
  import dayjs from 'dayjs'
  import { useUserStore } from '@/store/modules/user'

  const loading = ref(true)
  const articleId = ref(0)
  const router = useRoute()
  const articleTitle = ref('')
  const articleHtml = ref('')

  // 评论列表数据
  const commentList = ref<CommentType[]>([])

  const userStore = useUserStore()
  const currentUser = userStore.getUserInfo

  // 获取文章评论
  const getArticleComments = async () => {
    try {
      const res = await CommentService.getArticleComments(articleId.value)
      if (res.code === 200) {
        // 格式化评论日期
        commentList.value = res.data.map((comment) => ({
          ...comment,
          timestamp: dayjs(comment.timestamp).format('YYYY-MM-DD HH:mm'),
          replies: comment.replies.map((reply) => ({
            ...reply,
            timestamp: dayjs(reply.timestamp).format('YYYY-MM-DD HH:mm')
          }))
        }))
      } else {
        ElMessage.error(res.message || '获取评论失败')
      }
    } catch (error) {
      console.error('获取评论失败:', error)
      ElMessage.error('获取评论失败')
    }
  }

  // 提交评论
  const handleCommentSubmit = async () => {
    try {
      const res = await CommentService.createComment({
        post_id: articleId.value,
        content: newComment.value.content,
        author: currentUser.name
      })

      if (res.code === 200) {
        ElMessage.success('评论成功')
        // 直接在前端添加新评论
        commentList.value.unshift({
          id: res.data, // 后端返回的评论ID
          author: currentUser.name,
          content: newComment.value.content,
          timestamp: dayjs().format('YYYY-MM-DD HH:mm'),
          replies: []
        })
        newComment.value.content = ''
      } else {
        ElMessage.error(res.message || '评论失败')
      }
    } catch (error) {
      console.error('提交评论失败:', error)
      ElMessage.error('评论失败')
    }
  }

  // 提交回复
  const handleReplySubmit = async (commentId: number, content: string) => {
    try {
      const res = await CommentService.createComment({
        post_id: articleId.value,
        content,
        parent_id: commentId,
        author: currentUser.name
      })

      if (res.code === 200) {
        ElMessage.success('回复成功')
        // 找到父评论并添加回复
        const parentComment = commentList.value.find((c) => c.id === commentId)
        if (parentComment) {
          parentComment.replies.push({
            id: res.data,
            author: currentUser.name,
            content,
            timestamp: dayjs().format('YYYY-MM-DD HH:mm'),
            replies: []
          })
        }
        // 关闭回复框
        showReplyForm.value = null
      } else {
        ElMessage.error(res.message || '回复失败')
      }
    } catch (error) {
      console.error('提交回复失败:', error)
      ElMessage.error('回复失败')
    }
  }

  onMounted(() => {
    scrollToTop()
    articleId.value = Number(router.query.id)
    getArticleDetail()
    getArticleComments()
  })

  const getArticleDetail = async () => {
    if (articleId.value) {
      try {
        const res = await ArticleService.getArticleDetail(articleId.value)
        if (res.code === 200) {
          const { title, html_content } = res.data
          articleTitle.value = title
          articleHtml.value = html_content
        } else {
          ElMessage.error(res.message || '获取文章详情失败')
        }
      } catch (error) {
        console.error('获取文章详情失败:', error)
        ElMessage.error('获取文章详情失败')
      } finally {
        // 数据加载完成后关闭骨架屏
        loading.value = false
      }
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const comments = commentList

  const newComment = ref<Partial<Comment>>({
    content: ''
  })

  const showReplyForm = ref<number | null>(null)

  const toggleReply = (commentId: number) => {
    showReplyForm.value = showReplyForm.value === commentId ? null : commentId
  }

  // 删除评论
  const handleDeleteComment = async (commentId: number) => {
    try {
      await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      const res = await CommentService.deleteComment(commentId)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        await getArticleComments()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除评论失败:', error)
        ElMessage.error('删除失败')
      }
    }
  }

  // 编辑评论
  const handleEditComment = async (commentId: number) => {
    try {
      const comment = commentList.value.find((c) => c.id === commentId)
      if (!comment) return

      const { value: content } = await ElMessageBox.prompt('编辑评论', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: comment.content,
        inputValidator: (value) => {
          if (!value) {
            return '评论内容不能为空'
          }
          return true
        }
      })

      if (content === comment.content) return

      const res = await CommentService.updateComment({
        comment_id: commentId,
        content
      })

      if (res.code === 200) {
        ElMessage.success('修改成功')
        await getArticleComments()
      } else {
        ElMessage.error(res.message || '修改失败')
      }
    } catch (error) {
      if (error !== 'cancel') {
        console.error('编辑评论失败:', error)
        ElMessage.error('编辑失败')
      }
    }
  }
</script>

<style lang="scss">
  .article-detail {
    .content {
      max-width: 800px;
      margin: auto;
      margin-top: 60px;

      .markdown-body {
        margin-top: 60px;

        img {
          width: 100%;
          border: 1px solid var(--art-gray-200);
        }

        pre {
          position: relative;

          &:hover {
            .copy-button {
              opacity: 1;
            }
          }

          &::before {
            position: absolute;
            top: 0;
            left: 50px;
            width: 1px;
            height: 100%;
            content: '';
            background: #0a0a0e;
          }
        }

        .code-wrapper {
          overflow-x: auto;
        }

        .line-number {
          position: sticky;
          left: 0;
          z-index: 2;
          box-sizing: border-box;
          display: inline-block;
          width: 50px;
          margin-right: 10px;
          font-size: 14px;
          color: #9e9e9e;
          text-align: center;
        }

        .copy-button {
          position: absolute;
          top: 6px;
          right: 6px;
          z-index: 1;
          width: 40px;
          height: 40px;
          font-size: 20px;
          line-height: 40px;
          color: #999;
          text-align: center;
          cursor: pointer;
          background-color: #000;
          border: none;
          border-radius: 8px;
          opacity: 0;
          transition: all 0.2s;
        }
      }
    }

    .skeleton-content {
      max-width: 800px;
      margin: auto;
      padding: 20px;
    }

    .skeleton-body {
      margin-top: 40px;
    }

    // 调整骨架屏样式以匹配实际内容
    :deep(.el-skeleton__h1) {
      height: 40px !important;
    }

    :deep(.el-skeleton__text) {
      height: 20px !important;
    }

    :deep(.el-skeleton__p) {
      height: 20px !important;
    }
  }
  .comment-module {
    margin-top: 40px;
    padding: 24px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;

    .comment-header {
      padding-bottom: 20px;
      font-size: 18px;
      font-weight: 500;
      color: var(--art-gray-900);
      border-bottom: 1px solid var(--el-border-color-lighter);
    }

    .comment-item {
      padding: 20px 0;
      margin-bottom: 0;
      border-bottom: 1px solid var(--el-border-color-lighter);

      &:last-child {
        border-bottom: none;
      }
    }

    form {
      margin: 24px 0 32px !important;

      > div {
        textarea {
          width: 100%;
          height: 120px;
          padding: 12px;
          margin-bottom: 16px;
          font-size: 14px;
          color: var(--el-text-color-regular);
          background: var(--el-input-bg-color);
          border: 1px solid var(--el-border-color);
          border-radius: 4px;
          resize: vertical;
          transition: all 0.3s;

          &:focus {
            border-color: var(--el-color-primary);
            outline: none;
          }

          &::placeholder {
            color: var(--el-text-color-placeholder);
          }
        }

        .btn {
          padding: 10px 24px;
          font-size: 14px;
          color: #fff;
          cursor: pointer;
          background-color: var(--el-color-primary);
          border: none;
          border-radius: 4px;
          transition: all 0.3s;

          &:hover {
            background-color: var(--el-color-primary-light-3);
          }
        }
      }
    }
  }
</style>
