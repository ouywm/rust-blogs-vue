<template>
  <div class="page-content">
    <el-row :gutter="20" style="margin-left: 15px">
      <el-button v-auth="'add'" @click="showModel('menu', null, true)">添加菜单</el-button>
    </el-row>

    <art-table :data="tableData">
      <template #default>
        <el-table-column prop="meta.title" label="菜单名称" />
        <el-table-column prop="path" label="路由" />

        <el-table-column prop="meta.authList" label="可操作权限">
          <template #default="scope">
            <el-popover
              v-for="(item, index) in scope.row.meta.authList"
              :key="index"
              placement="top-start"
              title="操作"
              :width="200"
              trigger="click"
            >
              <div style="margin: 0; text-align: right">
                <el-button size="small" type="primary" @click="showModel('button', item, true)">
                  编辑
                </el-button>
                <el-button size="small" type="danger" @click="deleteAuth(item)"> 删除</el-button>
              </div>
              <template #reference>
                <el-button class="small-btn">{{ item.title }}</el-button>
              </template>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column label="编辑时间" prop="update_time">
          <template #default="scope">
            {{ formatDate(scope.row.update_time) }}
          </template>
        </el-table-column>

        <el-table-column fixed="right" label="操作" width="180">
          <template #default="scope">
            <button-table type="add" v-auth="'add'" @click="showModel('menu', scope.row)" />
            <button-table type="edit" v-auth="'edit'" @click="showDialog('edit', scope.row)" />
            <button-table type="delete" v-auth="'delete'" @click="deleteMenu(scope.row)" />
          </template>
        </el-table-column>
      </template>
    </art-table>

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="700px" align-center>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="85px">
        <el-form-item label="菜单类型">
          <el-radio-group v-model="labelPosition" :disabled="disableMenuType">
            <el-radio-button value="menu" label="menu">菜单</el-radio-button>
            <el-radio-button value="button" label="button">权限</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <template v-if="labelPosition === 'menu'">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="菜单名称" prop="name">
                <el-input v-model="form.name" placeholder="菜单名称"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="路由地址" prop="path">
                <el-input v-model="form.path" placeholder="路由地址"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="权限标识" prop="label">
                <el-input v-model="form.label" placeholder="权限标识"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="图标" prop="icon">
                <icon-selector
                  @getIcon="getIcon"
                  :iconType="iconType"
                  :defaultIcon="form.icon"
                  width="229px"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="菜单排序" prop="sort" style="width: 100%">
                <el-input-number
                  v-model="form.sort"
                  style="width: 100%"
                  @change="handleChange"
                  :min="0"
                  controls-position="right"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="外部链接" prop="link">
                <el-input
                  v-model="form.link"
                  placeholder="外部链接/内嵌地址(https://www.baidu.com)"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="5">
              <el-form-item label="是否启用" prop="isEnable">
                <el-switch v-model="form.isEnable"></el-switch>
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item label="页面缓存" prop="keepAlive">
                <el-switch v-model="form.keepAlive"></el-switch>
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item label="是否显示" prop="isHidden">
                <el-switch v-model="form.isHidden"></el-switch>
                {{ form.isHidden }}
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item label="是否内嵌" prop="is_iframe">
                <el-switch v-model="form.is_iframe"></el-switch>
                {{ form.is_iframe }}
              </el-form-item>
            </el-col>
          </el-row>
        </template>

        <template v-if="labelPosition === 'button'">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="权限名称" prop="authName">
                <el-input v-model="form.authName" placeholder="权限名称"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="权限标识" prop="authLabel">
                <el-input v-model="form.authLabel" placeholder="权限标识"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="权限排序" prop="authSort" style="width: 100%">
                <el-input-number
                  v-model="form.authSort"
                  style="width: 100%"
                  @change="handleChange"
                  :min="1"
                  controls-position="right"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </template>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm()"> 确 定 </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { IconTypeEnum } from '@/enums/appEnum'
  import { MenuService } from '@/api/admin/menuApi'
  import { useMenuStore } from '@/store/modules/menu'
  import dayjs from 'dayjs'

  // 定义与后端匹配的类型
  interface MenuVO {
    id?: number
    path?: string
    name?: string
    meta: {
      title?: string
      icon?: string
      link?: string
      isIframe?: boolean
      keepAlive?: boolean
      isHide?: boolean
      isEnable?: boolean
      authList?: any[]
    }
    children: MenuVO[]
    update_time?: string
    permission?: string
    sort?: number
    parent_id?: number
  }

  // 修改表格数据类型
  const tableData = ref<MenuVO[]>([])
  const menuStore = useMenuStore()
  const getIcon = (icon: string) => {
    form.icon = icon
  }
  // 获取菜单列表
  const getMenuList = async () => {
    try {
      const res = await MenuService.getMenuList()
      if (res.code === 200) {
        // 处理菜单数据，为每个菜单项添加父ID
        const processMenus = (menus: MenuVO[]) => {
          return menus.map((menu) => {
            if (menu.children?.length) {
              menu.children = processMenus(menu.children)
              menu.children.forEach((child) => {
                child.parent_id = menu.id
              })
            }
            return menu
          })
        }

        tableData.value = processMenus(res.data)
        menuStore.setMenuList(tableData.value)
      }
    } catch {
      ElMessage.error('获取菜单列表失败')
    }
  }

  // 页面加载时获取数据
  onMounted(() => {
    getMenuList()
  })

  const dialogVisible = ref(false)
  const form = reactive({
    menu_id: 0,
    name: '',
    path: '',
    label: '',
    icon: '',
    isEnable: true,
    sort: 1,
    keepAlive: false,
    isHidden: false,
    link: '',
    is_iframe: false,
    parent_id: 0,
    authName: '',
    authLabel: '',
    authIcon: '',
    authSort: 1
  })
  const iconType = ref(IconTypeEnum.UNICODE)

  const labelPosition = ref('menu')
  const rules = reactive<FormRules>({
    name: [
      { required: true, message: '请输入菜单名称', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    path: [{ required: true, message: '请输入路由地址', trigger: 'blur' }],
    label: [{ required: true, message: '输入权限标识', trigger: 'blur' }],
    authName: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
    authLabel: [{ required: true, message: '请输入权限权限标识', trigger: 'blur' }]
  })

  const isEdit = ref(false)
  const formRef = ref<FormInstance>()
  const dialogTitle = computed(() => {
    const type = labelPosition.value === 'menu' ? '菜单' : '权限'
    return isEdit.value ? `编辑${type}` : `新建${type}`
  })

  const showDialog = (type: string, row: MenuVO) => {
    isEdit.value = true
    dialogVisible.value = true
    labelPosition.value = 'menu'
    lockMenuType.value = true

    // 重置表单
    resetForm()

    // 回显数据
    nextTick(() => {
      console.log('回显数据:', row)
      form.menu_id = row.id
      form.name = row.meta.title
      form.path = row.path
      form.label = row.permission
      form.icon = row.meta.icon
      form.sort = row.sort
      form.keepAlive = row.meta.keepAlive
      form.isHidden = !row.meta.isHide
      form.isEnable = row.meta.isEnable
      form.is_iframe = row.meta.isIframe
      form.link = row.meta.link
      form.parent_id = row.parent_id || 0
    })
  }

  const handleChange = () => {}

  // 显示新增对话框（包括顶级菜单和子菜单）
  const showModel = (type: string, row?: any, lock: boolean = false) => {
    isEdit.value = false
    dialogVisible.value = true
    labelPosition.value = type
    lockMenuType.value = lock

    // 重置表单
    resetForm()

    // 如果是新增子菜单，设置父ID
    if (row) {
      form.parent_id = row.id
    }
  }

  // 提交表单
  const submitForm = async () => {
    if (!formRef.value) return

    try {
      const valid = await formRef.value.validate()
      if (!valid) return

      const isMenuType = labelPosition.value === 'menu'
      const baseParams: Record<string, any> = {
        title: isMenuType ? form.name : form.authName,
        icon: form.icon,
        is_enable: form.isEnable ? 0 : 1,
        keep_alive: form.keepAlive ? 0 : 1,
        is_hide: form.isHidden ? 1 : 0,
        is_iframe: form.is_iframe ? 0 : 1,
        link: form.link,
        permission: isMenuType ? form.label : form.authLabel,
        order_num: isMenuType ? form.sort : form.authSort,
        menu_type: lockMenuType.value ? 'M' : isMenuType ? 'C' : 'F',
        parent_id: form.parent_id
      }

      // 处理路径相关参数
      const pathParams = isMenuType ? { path: form.path } : {}

      // 合并最终参数
      const finalParams = {
        ...baseParams,
        ...pathParams,
        ...(isEdit.value && { menu_id: form.menu_id })
      }

      // // 如果是编辑模式，添加 menu_id
      // if (isEdit.value && form.menu_id) {
      //   finalParams.menu_id = form.menu_id
      // }

      console.log('提交的参数:', finalParams)

      // 执行请求
      const serviceMethod = isEdit.value ? MenuService.updateMenu : MenuService.createMenu
      const res = await serviceMethod(finalParams)

      if (res.code === 200) {
        ElMessage.success(isEdit.value ? '修改成功' : '添加成功')
        dialogVisible.value = false
        await getMenuList()
      }
    } catch {
      ElMessage.error(isEdit.value ? '修改失败' : '添加失败')
    }
  }

  const resetForm = () => {
    formRef.value?.resetFields()
    Object.assign(form, {
      menu_id: 0,
      name: '',
      path: '',
      label: '',
      icon: '',
      sort: 1,
      keepAlive: false,
      isHidden: false,
      isEnable: true,
      link: '',
      is_iframe: false,
      parent_id: 0,
      authName: '',
      authLabel: '',
      authIcon: '',
      authSort: 1
    })
  }

  const deleteMenu = async (row: any) => {
    try {
      await ElMessageBox.confirm('确定要删除该菜单吗？删除后无法恢复', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      const res = await MenuService.deleteMenu(row.id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        // 刷新列表
        await getMenuList()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败')
      }
    }
  }

  const deleteAuth = async (row: any) => {
    try {
      await ElMessageBox.confirm('确定要删除该权限吗？删除后无法恢复', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      const res = await MenuService.deleteMenu(row.id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        // 刷新列表
        await getMenuList()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败')
      }
    }
  }

  // 修改计算属性
  const disableMenuType = computed(() => {
    // 编辑时或顶部添加菜单时锁定类型
    return isEdit.value || lockMenuType.value
  })

  // 添加一个控制变量
  const lockMenuType = ref(false)

  // 修改日期格式化函数
  const formatDate = (date: string | null) => {
    if (!date) return '-'
    const parsed = dayjs(date)
    return parsed.isValid() ? parsed.format('YYYY-MM-DD HH:mm:ss') : '-'
  }
</script>

<style lang="scss" scoped>
  .page-content {
    .svg-icon {
      width: 1.8em;
      height: 1.8em;
      overflow: hidden;
      vertical-align: -8px;
      fill: currentcolor;
    }

    :deep(.small-btn) {
      height: 30px !important;
      padding: 0 10px !important;
      font-size: 12px !important;
    }
  }
</style>
