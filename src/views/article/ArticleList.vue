<template>
  <div class="page-content article-list">
    <el-row justify="space-between" :gutter="10">
      <el-col :lg="6" :md="6" :sm="14" :xs="16">
        <el-input
          v-model="searchVal"
          :prefix-icon="Search"
          clearable
          placeholder="输入文章标题查询"
          @keyup.enter="searchArticle"
        />
      </el-col>
      <el-col :lg="12" :md="12" :sm="0" :xs="0">
        <div class="custom-segmented">
          <el-segmented v-model="yearVal" :options="options" @change="searchArticleByYear" />
        </div>
      </el-col>
      <el-col :lg="6" :md="6" :sm="10" :xs="6" style="display: flex; justify-content: end">
        <el-button @click="toAddArticle" v-auth="'add'">新增文章</el-button>
      </el-col>
    </el-row>

    <div class="list">
      <div class="offset">
        <div class="item" v-for="item in articleList" :key="item.id" @click="toDetail(item)">
          <el-skeleton animated :loading="isLoading" style="width: 100%; height: 100%">
            <template #template>
              <div class="top">
                <el-skeleton-item
                  variant="image"
                  style="width: 100%; height: 100%; border-radius: 10px"
                />
              </div>
              <div style="padding: 16px 0">
                <el-skeleton-item variant="p" style="width: 80%" />
                <el-skeleton-item variant="p" style="width: 40%; margin-top: 10px" />
              </div>
            </template>

            <template #default>
              <div class="top">
                <el-image 
                  class="cover" 
                  :src="item.home_img" 
                  lazy 
                  fit="cover"
                  loading="lazy"
                >
                  <template #placeholder>
                    <div class="image-placeholder">
                      <el-skeleton-item
                        variant="image"
                        style="width: 100%; height: 100%; border-radius: 10px"
                      />
                    </div>
                  </template>
                  <template #error>
                    <div class="image-slot">
                      <el-icon><icon-picture /></el-icon>
                    </div>
                  </template>
                </el-image>

                <span class="type">{{ item.type_name }}</span>
              </div>
              <div class="bottom">
                <h2>{{ item.title }}</h2>
                <div class="info">
                  <div class="text">
                    <i class="iconfont-sys">&#xe6f7;</i>
                    <span>{{ useDateFormat(item.created_time, 'YYYY-MM-DD') }}</span>
                    <div class="line"></div>
                    <i class="iconfont-sys">&#xe689;</i>
                    <span>{{ item.view_count }}</span>
                  </div>
                  <div class="btn-group">
                    <el-button v-auth="'edit'" size="small" @click.stop="toEdit(item)">
                      编辑
                    </el-button>
                    <el-button 
                      v-auth="'delete'" 
                      type="danger" 
                      size="small" 
                      @click.stop="handleDelete(item)"
                    >
                      删除
                    </el-button>
                  </div>
                </div>
              </div>
            </template>
          </el-skeleton>
        </div>
      </div>
    </div>

    <div style="margin-top: 16vh" v-if="showEmpty">
      <el-empty :description="`未找到相关数据 ${EmojiText[0]}`" />
    </div>

    <div style="display: flex; justify-content: center; margin-top: 20px">
      <el-pagination
        size="default"
        background
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :pager-count="9"
        layout="prev, pager, next, total,jumper"
        :total="total"
        :hide-on-single-page="true"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Picture as IconPicture } from '@element-plus/icons-vue'

  import { ref, onMounted, computed } from 'vue'
  import { ArticleType } from '@/api/model/articleModel'
  import { ArticleService } from '@/api/admin/articleApi'
  import { router } from '@/router'
  import { useDateFormat } from '@vueuse/core'
  import { Search } from '@element-plus/icons-vue'
  import EmojiText from '@/utils/emojo'
  import { ElMessage } from 'element-plus'

  const yearVal = ref('All')

  const options = ['All', '2024', '2023', '2022', '2021', '2020', '2019']

  const searchVal = ref('')
  const articleList = ref<ArticleType[]>([])
  const currentPage = ref(1)
  const pageSize = ref(40)
  const total = ref(0)
  const isLoading = ref(true)

  const showEmpty = computed(() => {
    return !isLoading.value && articleList.value.length === 0
  })

  onMounted(() => {
    getArticleList({ backTop: false })
  })

  // 搜索文章
  const searchArticle = () => {
    currentPage.value = 1
    getArticleList({ backTop: true })
  }

  // 根据年份查询文章
  const searchArticleByYear = () => {
    currentPage.value = 1
    getArticleList({ backTop: true })
  }

  const getArticleList = async ({ backTop = false }) => {
    try {
      isLoading.value = true
      const params = {
        page: currentPage.value,
        size: pageSize.value,
        title: searchVal.value || undefined,
        year: yearVal.value === 'All' ? undefined : yearVal.value
      }

      const res = await ArticleService.getArticleList(params)
      if (res.code === 200) {
        articleList.value = res.data
        total.value = parseInt(res.total)

        if (backTop) {
          scrollToTop()
        }
      } else {
        ElMessage.error(res.message || '获取文章列表失败')
      }
    } catch (err) {
      console.error('获取文章列表失败:', err)
      ElMessage.error('获取文章列表失败')
    } finally {
      isLoading.value = false
    }
  }

  const handleCurrentChange = (val: number) => {
    currentPage.value = val
    getArticleList({ backTop: true })
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toDetail = (item: ArticleType) => {
    router.push({
      path: `/article/detail`,
      query: {
        id: item.id
      }
    })
  }

  const toEdit = (item: ArticleType) => {
    router.push({
      path: `/article/article-publish`,
      query: {
        id: item.id
      }
    })
  }

  const toAddArticle = () => {
    router.push({
      path: `/article/article-publish`
    })
  }
  // 删除文章
  const handleDelete = async (item: ArticleType) => {
    try {
      await ElMessageBox.confirm('确定要删除该文章吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      const res = await ArticleService.deleteArticle(item.id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        // 刷新列表
        await getArticleList({ backTop: false })
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除文章失败:', error)
        ElMessage.error('删除失败')
      }
    }
  }
</script>

<style lang="scss" scoped>
  .article-list {
    .custom-segmented .el-segmented {
      height: 40px;
      padding: 6px;

      --el-border-radius-base: 8px;
    }

    .list {
      margin-top: 20px;

      .offset {
        display: flex;
        flex-wrap: wrap;
        width: calc(100% + 20px);

        .item {
          box-sizing: border-box;
          width: calc(20% - 20px);
          margin: 0 20px 20px 0;
          cursor: pointer;
          border: 1px solid var(--art-border-color);
          border-radius: calc(var(--custom-radius) / 2 + 2px) !important;

          &:hover {
            .el-button {
              opacity: 1 !important;
            }
          }

          .top {
            position: relative;
            aspect-ratio: 16/9.5;

            .cover {
              width: 100%;
              height: 100%;
              
              .image-placeholder {
                width: 100%;
                height: 100%;
                background-color: var(--el-skeleton-color);
              }

              .image-slot {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 100%;
                font-size: 26px;
                color: var(--art-gray-400);
                background-color: var(--art-gray-200);
              }
            }

            .type {
              position: absolute;
              top: 5px;
              right: 5px;
              padding: 5px 4px;
              font-size: 12px;
              color: var(--art-gray-300);
              background: rgba($color: #000, $alpha: 60%);
              border-radius: 4px;
            }
          }

          .bottom {
            padding: 5px 10px;

            h2 {
              font-size: 16px;
              font-weight: 500;
              color: #333;

              @include ellipsis();
            }

            .info {
              display: flex;
              justify-content: space-between;
              width: 100%;
              height: 25px;
              margin-top: 6px;
              line-height: 25px;

              .text {
                display: flex;
                align-items: center;
                color: var(--art-text-gray-600);

                i {
                  margin-right: 5px;
                  font-size: 14px;
                }

                span {
                  font-size: 13px;
                }

                .line {
                  width: 1px;
                  height: 12px;
                  margin: 0 15px;
                  background-color: var(--art-border-dashed-color);
                }
              }

              .btn-group {
                display: flex;
                gap: 4px;

                .el-button {
                  opacity: 0;
                  transition: all 0.3s;
                }
              }
            }
          }
        }
      }
    }
  }

  @media only screen and (max-width: $device-notebook) {
    .article-list {
      .list {
        .offset {
          .item {
            width: calc(25% - 20px);
          }
        }
      }
    }
  }

  @media only screen and (max-width: $device-ipad-pro) {
    .article-list {
      .list {
        .offset {
          .item {
            width: calc(33.333% - 20px);

            .bottom {
              h2 {
                font-size: 16px;
              }
            }
          }
        }
      }
    }
  }

  @media only screen and (max-width: $device-ipad) {
    .article-list {
      .list {
        .offset {
          .item {
            width: calc(50% - 20px);
          }
        }
      }
    }
  }

  @media only screen and (max-width: $device-phone) {
    .article-list {
      .list {
        .offset {
          .item {
            width: calc(100% - 20px);
          }
        }
      }
    }
  }
</style>
