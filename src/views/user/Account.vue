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
            <form-input label="用户名" prop="name" v-model="searchForm.name" />
            <form-input label="手机号" prop="phone" v-model="searchForm.phone" />
            <form-input label="邮箱" prop="email" v-model="searchForm.email" />
            <form-input label="账号" prop="account" v-model="searchForm.account" />
          </el-row>
          <el-row :gutter="20">
            <form-input label="用户ID" prop="id" v-model="searchForm.id" />
            <form-select label="性别" prop="sex" v-model="searchForm.sex" :options="sexOptions" />
            <form-select
              label="会员等级"
              prop="level"
              v-model="searchForm.level"
              :options="levelOptions"
            />
          </el-row>
        </el-form>
      </template>
      <template #bottom>
        <el-button @click="showDialog('add')">添加用户</el-button>
      </template>
    </table-bar>

    <art-table
      :data="tableData"
      selection
      :currentPage="currentPage"
      :pageSize="pageSize"
      :total="total"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
    >
      <template #default>
        <el-table-column
          label="用户名"
          prop="avatar"
          #default="scope"
          width="300px"
          v-if="columns[0].show"
        >
          <div class="user" style="display: flex; align-items: center">
            <img class="avatar" :src="scope.row.avatar" />
            <div>
              <p class="user-name">{{ scope.row.username }}</p>
              <p class="email">{{ scope.row.email }}</p>
            </div>
          </div>
        </el-table-column>
        <el-table-column label="手机号" prop="phone" v-if="columns[1].show" />
        <el-table-column label="性别" prop="sex" #default="scope" sortable v-if="columns[2].show">
          {{ scope.row.sex === 1 ? '男' : '女' }}
        </el-table-column>
        <el-table-column
          label="状态"
          prop="status"
          :filters="[
            { text: '启用', value: '1' },
            { text: '禁用', value: '2' }
          ]"
          :filter-method="filterTag"
          filter-placement="bottom-end"
          v-if="columns[3].show"
        >
          <template #default="scope">
            <el-tag :type="getTagType(scope.row.status)">
              {{ buildTagText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建日期" prop="create_time" sortable v-if="columns[4].show">
          <template #default="scope">
            {{ formatDate(scope.row.create_time) }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="150px">
          <template #default="scope">
            <button-table type="edit" @click="showDialog('edit', scope.row)" />
            <button-table type="delete" @click="deleteUser(scope.row)" />
          </template>
        </el-table-column>
      </template>
    </art-table>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加用户' : '编辑用户'"
      width="30%"
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" :disabled="dialogType === 'edit'" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="formData.nickname" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" />
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-radio-group v-model="formData.sex">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="角色" prop="roleIds">
          <el-select
            v-model="formData.roleIds"
            multiple
            placeholder="请选择角色"
            style="width: 100%"
          >
            <el-option
              v-for="role in roleOptions"
              :key="role.role_id"
              :label="role.role_name"
              :value="role.role_id"
            >
              <span>{{ role.role_name }}</span>
              <span style="color: #999; font-size: 13px; margin-left: 10px">
                {{ role.role_desc }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">提交</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ACCOUNT_TABLE_DATA } from '@/mock/formData'
  import { FormInstance } from 'element-plus'
  import { ElMessageBox, ElMessage } from 'element-plus'
  import type { FormRules } from 'element-plus'
  import { UserService } from '@/api/admin/usersApi'
  import { onMounted } from 'vue'
  import dayjs from 'dayjs'
  import { CreateParam, UpdateParam } from '@/api/model/createModel'
  import { UserWithRoles } from '@/api/model/userModel'

  const dialogType = ref('add')
  const dialogVisible = ref(false)

  interface RoleOption {
    role_id: number
    role_name: string
    role_code: string
    role_desc: string
    status: number
  }

  // 定义表单数据接口
  interface FormData {
    user_id?: number
    username: string
    nickname: string
    phone: string
    email: string
    sex: number
    status: number
    roleIds: number[]
  }

  // 使用 ref 而不是 reactive 来管理表单数据
  const formData = ref<FormData>({
    user_id: undefined,
    username: '',
    nickname: '',
    phone: '',
    email: '',
    sex: 1,
    status: 1,
    roleIds: []
  })

  const sexOptions = [
    {
      value: '男',
      label: '男'
    },
    {
      value: '女',
      label: '女'
    }
  ]
  const levelOptions = [
    {
      value: '1',
      label: '普通用户'
    },
    {
      value: '2',
      label: ' VIP'
    }
  ]

  const columns = reactive([
    { name: '用户名', show: true },
    { name: '手机号', show: true },
    { name: '性别', show: true },
    { name: '状态', show: true },
    { name: '创建日期', show: true }
  ])

  const searchFormRef = ref<FormInstance>()
  const searchForm = reactive({
    name: '',
    phone: '',
    email: '',
    account: '',
    id: '',
    sex: '',
    level: ''
  })

  const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.resetFields()
  }

  // const tableData = ACCOUNT_TABLE_DATA

  const showDialog = async (type: string, row?: UserWithRoles) => {
    dialogVisible.value = true
    dialogType.value = type

    // 获取角色列表
    await getRoleOptions()

    if (type === 'edit' && row) {
      formData.value = {
        user_id: row.user_id,
        username: row.username,
        nickname: row.nickname,
        phone: row.phone,
        email: row.email,
        sex: row.sex,
        status: row.status,
        roleIds: row.role_ids
      }
    } else {
      formData.value = {
        user_id: undefined,
        username: '',
        nickname: '',
        phone: '',
        email: '',
        sex: 1,
        status: 1,
        roleIds: []
      }
    }
  }

  const deleteUser = async (row: any) => {
    try {
      await ElMessageBox.confirm('确定要注销该用户吗？', '注销用户', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      })

      const res = await UserService.deleteUser(row.user_id)
      if (res.code === 200) {
        ElMessage.success('注销成功')
        await search() // 刷新列表
      }
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('注销失败')
      }
    }
  }
  const tableData = ref<UserWithRoles[]>([])

  const search = async () => {
    try {
      const res = await UserService.getUserList({
        page: currentPage.value,
        size: pageSize.value,
        ...searchForm.value
      })
      if (res.code === 200) {
        const data = res.data as TableData
        tableData.value = data.list
        total.value = data.total
        ElMessage.success('搜索成功')
      }
    } catch (err: any) {
      console.error('搜索失败:', err)
      ElMessage.error('搜索失败')
    }
  }

  const changeColumn = (list: any) => {
    columns.values = list
  }

  const filterTag = (value: string, row: any) => {
    return row.status === value
  }

  const getTagType = (status: number) => {
    switch (status) {
      case 1:
        return 'success'
      case 0:
        return 'danger'
      default:
        return 'info'
    }
  }

  const buildTagText = (status: number) => {
    return status === 1 ? '启用' : '禁用'
  }

  const rules = reactive<FormRules>({
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    phone: [
      { required: true, message: '请输入手机号', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
    ],
    email: [
      { required: false, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
    ],
    sex: [{ required: true, message: '请选择性别', trigger: 'change' }],
    roleIds: [{ required: true, message: '请选择角色', trigger: 'change' }]
  })

  const formRef = ref<FormInstance>()

  // 创建用户
  const handleCreate = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (valid) {
        try {
          const createData: CreateParam = {
            username: formData.value.username,
            nickname: formData.value.nickname,
            email: formData.value.email,
            phone: formData.value.phone,
            status: formData.value.status,
            sex: formData.value.sex,
            role_ids: formData.value.roleIds
          }

          const res = await UserService.createUser(createData)
          if (res.code === 200) {
            ElMessage.success('添加成功')
            dialogVisible.value = false
            await search()
          }
        } catch (err) {
          console.error(err)
          ElMessage.error('添加失败')
        }
      }
    })
  }

  // 更新用户
  const handleUpdate = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (valid) {
        try {
          const updateData: UpdateParam = {
            user_id: formData.value.user_id!,
            nickname: formData.value.nickname,
            email: formData.value.email,
            phone: formData.value.phone,
            status: formData.value.status,
            sex: formData.value.sex,
            role_ids: formData.value.roleIds
          }

          const res = await UserService.updateUser(updateData)
          if (res.code === 200) {
            ElMessage.success('更新成功')
            dialogVisible.value = false
            await search()
          }
        } catch (err) {
          console.error(err)
          ElMessage.error('更新失败')
        }
      }
    })
  }

  // 提交处理
  const handleSubmit = () => {
    if (dialogType.value === 'add') {
      handleCreate()
    } else {
      handleUpdate()
    }
  }

  // 添加分页相关变量
  const currentPage = ref(1)
  const pageSize = ref(10)
  const total = ref(0)

  // 监听分页变化
  const handleCurrentChange = (page: number) => {
    currentPage.value = page
    search()
  }

  const handleSizeChange = (size: number) => {
    pageSize.value = size
    currentPage.value = 1 // 切换每页条数时重置为第一页
    search()
  }

  // 添加 onMounted 钩子函数
  onMounted(async () => {
    await search() // 组件挂载时加载用户列表
  })

  // 修改日期格式化函数
  const formatDate = (date: string | null) => {
    if (!date) return '-'
    const parsed = dayjs(date)
    return parsed.isValid() ? parsed.format('YYYY-MM-DD HH:mm:ss') : '-'
  }

  // 添加角色选项
  const roleOptions = ref<RoleOption[]>([])

  // 获取所有角色列表
  const getRoleOptions = async () => {
    try {
      const res = await UserService.getRoleList()
      if (res.code === 200) {
        roleOptions.value = res.data.list
      }
    } catch (err: any) {
      console.error('获取角色列表失败:', err)
      ElMessage.error('获取角色列表失败')
    }
  }
</script>

<style lang="scss" scoped>
  .page-content {
    width: 100%;
    height: 100%;

    .user {
      .avatar {
        width: 40px;
        height: 40px;
        border-radius: 6px;
      }

      > div {
        margin-left: 10px;

        .user-name {
          font-weight: 500;
          color: var(--art-text-gray-800);
        }
      }
    }
  }
</style>
