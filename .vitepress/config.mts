import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: '博客记录',
  description: 'vitepress',
  head: [['link', { rel: 'icon', type: 'image/png', href: '/favicon.png' }]],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo.svg',
    siteTitle: '博客记录',
    nav: [
      { text: 'Home', link: '/' },
      {
        text: '前端',
        items: [
          { text: '如何使用Cloudflare搭建一个无限邮箱', link: '/frontend/如何使用Cloudflare搭建一个无限邮箱' },
          { text: '在YCursor中使用无限邮箱', link: '/frontend/在YCursor中使用无限邮箱' },
        ],
      },
      {
        text: '后端',
        items: [],
      },
      {
        text: 'Linux',
        items: [],
      },
      {
        text: '第N次入门Rust',
        items: [],
      },
      {
        text: 'Flutter学习',
        link: '/flutter/study_plan',
      },
    ],

    sidebar: [
      {
        text: '前端',
        items: [
          { text: '如何使用Cloudflare搭建一个无线邮箱', link: '/frontend/如何使用Cloudflare搭建一个无限邮箱' },
          { text: '在YCursor中使用无限邮箱', link: '/frontend/在YCursor中使用无限邮箱' },
        ],
      },
      {
        text: 'Flutter学习',
        items: [
          { text: '学习计划', link: '/flutter/study_plan' },
          { text: '1. Flutter基础', link: '/flutter/basics/flutter_introduction' },
          { text: '2. Dart语言基础', link: '/flutter/basics/dart_basics' },
          { text: '3. Flutter UI基础', link: '/flutter/ui/flutter_ui_basics' },
          { text: '4. 布局与组件', link: '/flutter/ui/flutter_layout_and_components' },
          { text: '5. 状态管理', link: '/flutter/intermediate/state_management' },
          { text: '6. 网络与数据', link: '/flutter/intermediate/networking_and_data' },
          { text: '7. 路由与导航', link: '/flutter/intermediate/routing_and_navigation' },
          { text: '8. 本地存储', link: '/flutter/intermediate/local_storage' },
          { text: '9. 动画效果', link: '/flutter/intermediate/animation_effects' },
          { text: '10. 原生集成', link: '/flutter/advanced/native_integration' },
          { text: '11. 性能优化', link: '/flutter/advanced/performance_optimization' },
          { text: '12. 发布应用', link: '/flutter/advanced/app_publishing' },
          { text: '13. 实战项目', link: '/flutter/projects/practical_project_overview' },
        ],
      },
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/caigq99' }],
  },
})
