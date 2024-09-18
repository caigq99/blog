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
      { text: 'Examples', link: '/markdown-examples' },
      {
        text: '前端',
        items: [],
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
        text: '育儿知识',
        link: '/parenting/如何冲奶粉',
      },
    ],

    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' },
        ],
      },
      {
        text: '育儿知识',
        items: [
          { text: '如何冲奶粉', link: '/parenting/如何冲奶粉' },
          { text: '如何喂奶', link: '/parenting/如何喂奶' },
          { text: '如何拍嗝', link: '/parenting/如何拍嗝' },
          { text: '如何缓解宝宝肠胀气', link: '/parenting/如何缓解宝宝肠胀气' },
          { text: '吐奶、溢奶、呛奶', link: '/parenting/吐奶、溢奶、呛奶' },
        ],
      },
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/caigq99' }],
  },
})
