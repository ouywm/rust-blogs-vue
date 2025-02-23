<template>
  <div class="page-content">
    <el-row>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-input
          v-model="searchForm.role_name"
          placeholder="角色名称"
          @keyup.enter="handleSearch"
        />
      </el-col>
      <div style="width: 12px"></div>
      <el-col :xs="24" :sm="12" :lg="6" class="el-col2">
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button type="primary" @click="showDialog('add')">新增角色</el-button>
      </el-col>
    </el-row>

    <art-table
      :data="tableData"
      :loading="loading"
      :currentPage="currentPage"
      :pageSize="pageSize"
      :total="total"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
    >
      <template #default>
        <el-table-column label="角色名称" prop="role_name" />
        <el-table-column label="描述" prop="role_desc" />
        <el-table-column label="状态" prop="status">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'primary' : 'info'">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="create_time">
          <template #default="scope">
            {{ formatDate(scope.row.create_time) }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="100px">
          <template #default="scope">
            <el-row>
              <button-more
                :list="[
                  { key: 'permission', label: '菜单权限' },
                  { key: 'edit', label: '编辑角色' },
                  { key: 'delete', label: '删除角色' }
                ]"
                @click="buttonMoreClick($event, scope.row)"
              />
            </el-row>
          </template>
        </el-table-column>
      </template>
    </art-table>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增角色' : '编辑角色'"
      width="30%"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="角色名称" prop="role_name">
          <el-input v-model="form.role_name" />
        </el-form-item>
        <el-form-item label="角色编码" prop="role_code">
          <el-input v-model="form.role_code" />
        </el-form-item>
        <el-form-item label="描述" prop="role_desc">
          <el-input v-model="form.role_desc" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit(formRef)">提交</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="permissionDialog" title="菜单权限" width="30%">
      <div :style="{ maxHeight: '500px', overflowY: 'scroll' }">
        <el-tree
          ref="menuTreeRef"
          :data="menuList"
          show-checkbox
          node-key="menu_id"
          :props="defaultProps"
          :default-checked-keys="defaultCheckedKeys"
          @check="handleTreeCheck"
        >
          <template #default="{ data }">
            <span class="custom-tree-node">
              <span :class="{ 'menu-title': true, 'is-button': data.meta.menuType === 'F' }">
                {{ data.meta.title }}
              </span>

              <el-tag :type="getTagType(data.meta.menuType)" size="small" class="menu-type-tag">
                {{ getMenuTypeLabel(data.meta.menuType) }}
              </el-tag>
            </span>
          </template>
        </el-tree>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ButtonMoreItem } from '@/components/Form/ButtonMore.vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { ref, reactive, onMounted, nextTick } from 'vue'
  import { RoleService } from '@/api/admin/roleApi'
  import type { RoleInfo } from '@/api/model/roleModel'
  import dayjs from 'dayjs'
  import { Folder, Menu, Operation } from '@element-plus/icons-vue'

  // 对话框控制
  const dialogVisible = ref(false)
  const permissionDialog = ref(false)
  const dialogType = ref('add')

  // 菜单树数据
  const menuList = ref<any[]>([])
  const defaultCheckedKeys = ref<number[]>([])

  // 表单相关
  const formRef = ref<FormInstance>()
  const form = reactive({
    role_id: undefined as number | undefined,
    role_name: '',
    role_code: '',
    role_desc: '',
    status: 1,
    menu_ids: [] as number[]
  })

  // 表单校验规则
  const rules = reactive<FormRules>({
    role_name: [
      { required: true, message: '请输入角色名称', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    role_code: [{ required: true, message: '请输入角色编码', trigger: 'blur' }],
    role_desc: [{ required: true, message: '请输入角色描述', trigger: 'blur' }]
  })

  // 分页参数
  const currentPage = ref(1)
  const pageSize = ref(10)
  const total = ref(0)
  const loading = ref(false)

  // 表格数据
  const tableData = ref<RoleInfo[]>([])

  // 搜索表单
  const searchForm = reactive({
    role_name: ''
  })

  // 菜单树引用
  const menuTreeRef = ref<InstanceType>()

  // 获取菜单类型标签
  const getMenuTypeLabel = (type: string) => {
    const labels = {
      M: '目录',
      C: '菜单',
      F: '按钮'
    }
    return labels[type] || ''
  }

  // 获取标签类型
  const getTagType = (type: string) => {
    const types = {
      M: 'success',
      C: 'primary',
      F: 'info'
    }
    return types[type] || ''
  }

  // 加载角色列表
  const loadRoleList = async () => {
    loading.value = true
    try {
      const res = await RoleService.getRoleList({
        page: currentPage.value,
        size: pageSize.value,
        role_name: searchForm.role_name
      })
      if (res.code === 200) {
        tableData.value = res.data.list
        total.value = res.data.total
      }
    } catch (_) {
      ElMessage.error('加载角色列表失败')
    } finally {
      loading.value = false
    }
  }

  // 处理树节点选中状态变化
  const handleTreeCheck = async (
    data: any,
    { checkedKeys }: { checkedKeys: number[], halfCheckedKeys: number[] }
  ) => {
    if (!menuTreeRef.value || !form.role_id) return

    try {
      // 只使用完全选中的节点ID，不包含半选中的节点
      const menuIds = checkedKeys.map(Number)

      // 发送更新请求
      const res = await RoleService.updateRoleMenus(form.role_id, menuIds)
      if (res.code === 200) {
        ElMessage.success('权限配置已更新')
      }
    } catch {
      ElMessage.error('权限配置更新失败')
    }
  }

  // 获取角色菜单权限
  const getRoleMenus = async (row: RoleInfo) => {
    try {
      form.role_id = row.role_id
      const res = await RoleService.getRoleMenus(row.role_id)
      if (res.code === 200) {
        menuList.value = res.data.menus
        defaultCheckedKeys.value = res.data.checkedKeys
        permissionDialog.value = true
      }
    } catch {
      ElMessage.error('获取权限配置失败')
    }
  }

  // 显示对话框
  const showDialog = (type: string, row?: RoleInfo) => {
    dialogVisible.value = true
    dialogType.value = type

    if (type === 'edit' && row) {
      form.role_id = row.role_id
      form.role_name = row.role_name
      form.role_code = row.role_code
      form.role_desc = row.role_desc
      form.status = row.status
    } else {
      form.role_id = undefined
      form.role_name = ''
      form.role_code = ''
      form.role_desc = ''
      form.status = 1
    }
  }

  // 按钮操作
  const buttonMoreClick = async (item: ButtonMoreItem, row: RoleInfo) => {
    switch (item.key) {
      case 'permission':
        await getRoleMenus(row)
        break
      case 'edit':
        showDialog('edit', row)
        break
      case 'delete':
        await handleDelete(row)
        break
    }
  }

  // 删除角色
  const handleDelete = async (row: RoleInfo) => {
    try {
      await ElMessageBox.confirm('确定要删除该角色吗？', '提示', {
        type: 'warning'
      })
      const res = await RoleService.deleteRole(row.role_id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        await loadRoleList()
      }
    } catch (_) {
      // 用户取消删除时不显示错误
    }
  }

  // 提交表单
  const handleSubmit = async (formEl: FormInstance | undefined) => {
    if (!formEl) return

    await formEl.validate(async (valid) => {
      if (valid) {
        try {
          const data = {
            ...form,
            menu_ids: form.menu_ids
          }

          const res =
            dialogType.value === 'add'
              ? await RoleService.createRole(data)
              : await RoleService.updateRole(data)

          if (res.code === 200) {
            ElMessage.success(`${dialogType.value === 'add' ? '新增' : '修改'}成功`)
            dialogVisible.value = false
            await loadRoleList()
          }
        } catch (_) {
          ElMessage.error(`${dialogType.value === 'add' ? '新增' : '修改'}失败`)
        }
      }
    })
  }

  // 搜索
  const handleSearch = () => {
    currentPage.value = 1
    loadRoleList()
  }

  // 分页改变
  const handleCurrentChange = (page: number) => {
    currentPage.value = page
    loadRoleList()
  }

  const handleSizeChange = (size: number) => {
    pageSize.value = size
    currentPage.value = 1
    loadRoleList()
  }

  // 格式化日期
  const formatDate = (date: string) => {
    if (!date) return ''
    return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
  }

  // 树形控件配置
  const defaultProps = {
    children: 'children',
    label: (data: any) => data.meta.title
  }

  onMounted(() => {
    loadRoleList()
  })
</script>

<style lang="scss" scoped>
  .custom-tree-node {
    display: flex;
    align-items: center;
    font-size: 14px;
    padding-right: 8px;

    .menu-icon {
      margin-right: 8px;
      font-size: 16px;
    }

    .menu-title {
      flex: 1;

      &.is-button {
        color: #666;
      }
    }

    .menu-type-tag {
      margin-left: 8px;
    }
  }

  .el-tree-node__content {
    height: 32px;
  }

  .page-content {
    .svg-icon {
      width: 1.8em;
      height: 1.8em;
      overflow: hidden;
      vertical-align: -8px;
      fill: currentcolor;
    }
  }
</style>
