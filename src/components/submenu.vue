<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import type { MenuInfo } from '@/api/model/menuModel'
import {
  Location,
  Document,
  Menu as MenuIcon,
  Setting,
  User,
  Lock,
  Key,
  UserFilled,
  Grid,
  List,
  Monitor
} from '@element-plus/icons-vue'

// 图标映射表
const iconMap = {
  Location,
  Document,
  Menu: MenuIcon,
  Setting,
  User,
  Lock,
  Key,
  Role: UserFilled,
  Grid,
  List,
  Monitor
}

const props = defineProps<{
  menu: MenuInfo
}>()

const router = useRouter()

// 处理菜单点击
const goPage = (menu: MenuInfo) => {
  if (!menu.path) return
  
  if (menu.external) {
    // 外部链接
    window.open(menu.external_url || menu.path, '_blank')
  } else {
    // 内部路由
    router.push(menu.path)
  }
}

// 获取图标组件
const getIcon = (iconName: string) => {
  return iconMap[iconName as keyof typeof iconMap] || Document
}
</script>

<template>
  <template v-if="menu.children && menu.children.length > 0">
    <el-sub-menu :index="menu.path || menu.name">
      <template #title>
        <el-icon v-if="menu.icon">
          <component :is="getIcon(menu.icon)" />
        </el-icon>
        <span>{{ menu.title || menu.meta?.title }}</span>
      </template>
      <submenu
        v-for="child in menu.children"
        :key="child.path || child.name"
        :menu="child"
      />
    </el-sub-menu>
  </template>
  <template v-else>
    <el-menu-item
      :index="menu.path || menu.name"
      @click="goPage(menu)"
    >
      <el-icon v-if="menu.icon">
        <component :is="getIcon(menu.icon)" />
      </el-icon>
      <template #title>
        <span>{{ menu.title || menu.meta?.title }}</span>
      </template>
    </el-menu-item>
  </template>
</template>

<style lang="scss" scoped>
.el-menu-item, :deep(.el-sub-menu__title) {
  .el-icon {
    font-size: 18px;
    vertical-align: middle;
    margin-right: 8px;
  }

  span {
    vertical-align: middle;
  }
}

:deep(.el-sub-menu .el-menu-item) {
  min-width: 0;
  padding-left: 50px !important;
}
</style> 