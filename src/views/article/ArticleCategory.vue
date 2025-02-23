<template>
  <div class="page-content">
    <table-bar
      :showTop="false"
      @search="search"
      @reset="resetForm(searchFormRef)"
      @changeColumn="changeColumn"
      :columns="columns"
    >
      <template #top>
        <el-form :model="searchForm" ref="searchFormRef" label-width="82px">
          <el-row :gutter="20">
            <form-input label="分类名称" prop="name" v-model="searchForm.name" />
          </el-row>
        </el-form>
      </template>
      <template #bottom>
        <el-button @click="showDialog('add')">添加分类</el-button>
      </template>
    </table-bar>

    <art-table
      :data="categoryList"
      selection
      :currentPage="currentPage"
      :pageSize="pageSize"
      :total="total"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
    >
      <template #default>
        <el-table-column label="分类名称" prop="name" />
        <el-table-column label="图标">
          <template #default="scope">
            <i class="iconfont-sys" v-html="scope.row.icon"></i>
          </template>
        </el-table-column>
        <el-table-column label="文章数量" prop="count" />
        <el-table-column fixed="right" label="操作" width="150">
          <template #default="scope">
            <button-table type="edit" @click="showDialog('edit', scope.row)" />
            <button-table type="delete" @click="handleDelete(scope.row.id)" />
          </template>
        </el-table-column>
      </template>
    </art-table>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加分类' : '编辑分类'"
      width="500px"
    >
      <el-form ref="formRef" :model="currentCategory" :rules="rules" label-width="80px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="currentCategory.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="分类图标">
          <IconSelector
            :iconType="IconTypeEnum.UNICODE"
            :default-icon="currentCategory.icon"
            @getIcon="handleIconSelect"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { ArticleCategoryService } from '@/api/admin/articleCategoryApi'
  import IconSelector from '@/components/Icons/IconSelector.vue'
  import { IconTypeEnum } from '@/enums/appEnum'
  import type { ArticleCategoryType } from '@/api/model/articleModel'

  const dialogType = ref('add')
  const dialogVisible = ref(false)
  const categoryList = ref<ArticleCategoryType[]>([])
  const formRef = ref<FormInstance>()
  const searchFormRef = ref<FormInstance>()
  const currentPage = ref(1)
  const pageSize = ref(10)
  const total = ref(0)

  const columns = reactive([
    { name: '分类名称', show: true },
    { name: '图标', show: true },
    { name: '文章数量', show: true }
  ])

  const searchForm = reactive({
    name: ''
  })

  const currentCategory = reactive({
    id: null as number | null,
    name: '',
    icon: '',
    count: 0
  })

  const rules = reactive<FormRules>({
    name: [
      { required: true, message: '请输入分类名称', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ]
  })

  const search = async () => {
    await getCategoryList()
  }

  const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.resetFields()
    search()
  }

  const showDialog = (type: string, row?: ArticleCategoryType) => {
    dialogVisible.value = true
    dialogType.value = type

    if (type === 'edit' && row) {
      Object.assign(currentCategory, {
        id: row.id,
        name: row.name,
        icon: row.icon,
        count: row.count
      })
    } else {
      Object.assign(currentCategory, {
        id: null,
        name: '',
        icon: '&#xe6b5;',
        count: 0
      })
    }
  }

  const getCategoryList = async () => {
    try {
      const res = await ArticleCategoryService.getArticleList()
      if (res.code === 200) {
        categoryList.value = res.data
        total.value = res.data.length
      } else {
        ElMessage.error(res.message || '获取分类列表失败')
      }
    } catch (error) {
      console.error('获取分类列表失败:', error)
      ElMessage.error('获取分类列表失败')
    }
  }

  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (valid) {
        try {
          const params = {
            name: currentCategory.name,
            icon_class: currentCategory.icon
          }

          let res
          if (currentCategory.id) {
            res = await ArticleCategoryService.updateCategory({
              id: currentCategory.id,
              ...params
            })
          } else {
            res = await ArticleCategoryService.createCategory(params)
          }

          if (res.code === 200) {
            ElMessage.success(`${currentCategory.id ? '更新' : '创建'}成功`)
            dialogVisible.value = false
            await getCategoryList()
          } else {
            ElMessage.error(res.message || `${currentCategory.id ? '更新' : '创建'}失败`)
          }
        } catch (error) {
          console.error(error)
          ElMessage.error(`${currentCategory.id ? '更新' : '创建'}失败`)
        }
      }
    })
  }

  const handleDelete = async (id: number) => {
    try {
      await ElMessageBox.confirm('确定要删除该分类吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      const res = await ArticleCategoryService.deleteCategory(id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        await getCategoryList()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除分类失败:', error)
        ElMessage.error('删除失败')
      }
    }
  }

  const handleIconSelect = (icon: string) => {
    currentCategory.icon = icon
  }

  const changeColumn = (list: any) => {
    columns.values = list
  }

  const handleCurrentChange = (val: number) => {
    currentPage.value = val
    search()
  }

  const handleSizeChange = (val: number) => {
    pageSize.value = val
    currentPage.value = 1
    search()
  }

  onMounted(() => {
    search()
  })
</script>

<style lang="scss" scoped>
  .page-content {
    width: 100%;
    height: 100%;

    :deep(.iconfont-sys) {
      font-size: 20px;
    }
  }
</style>
