// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },

  // --- 网站元数据 ---
  // 在此定义网站元数据以便复用
  // 重要：请将 'https://xinyue.best' 替换为你的实际生产环境域名
  site: {
    url: 'https://xinyue.best', // 你的生产环境 URL 对 sitemap、canonical URL 等至关重要
    name: '欣玥生日快乐', // 或者更合适的网站名称
    description: '生日快乐！天天开心！欣玥就是最棒的~', // 一个更通用的默认描述
    // 默认社交分享图片 (放置在 `public` 文件夹下)
    // 例如： public/social-share.png
    // 如果需要，请更新路径
    defaultImage: 'public/social-share.png',
  },

  modules: [
    '@nuxt/content',
    '@nuxt/image',
    '@nuxt/scripts',
    // --- SEO 相关模块 ---
    // 'nuxt-simple-sitemap', // 生成 sitemap.xml
    // 'nuxt-simple-robots',  // 生成 robots.txt
    // 可选: 'nuxt-schema-org', // 用于结构化数据 - 如果需要，可以稍后添加
  ],

  app: {
    head: {
      // --- 改进的标题处理 ---
      // 设置默认标题
      title: '欣玥生日快乐', // 如果页面没有设置特定标题，则使用此默认标题
      // 定义页面标题模板：页面标题 | 网站名称
      // '%s' 将会被页面特定的标题（通过 useSeoMeta 设置）替换
      titleTemplate: '%s | 欣玥生日快乐',

      // --- HTML 属性 ---
      htmlAttrs: {
        lang: 'zh-CN', // 设置网站的主要语言 (简体中文)
      },

      // --- Meta 标签 ---
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        // 使用上面 site.description 中定义的默认描述
        // 重要：在每个页面上使用 useSeoMeta 覆盖此项，以提供与页面内容相关的描述
        // hid 属性帮助确保覆盖能正确生效
        { hid: 'description', name: 'description', content: '生日快乐！天天开心！欣玥就是最棒的~' },

        // --- Open Graph (用于 Facebook, LinkedIn 等) ---
        { hid: 'og:site_name', property: 'og:site_name', content: '欣玥生日快乐' },
        { hid: 'og:type', property: 'og:type', content: 'website' },
        // 默认 OG 标题 (会被页面特定标题通过 titleTemplate 覆盖)
        { hid: 'og:title', property: 'og:title', content: '欣玥生日快乐' },
        // 默认 OG 描述 (应在每个页面上覆盖)
        { hid: 'og:description', property: 'og:description', content: '生日快乐！天天开心！欣玥就是最棒的~' },
        // 默认 OG 图片 (如果需要，可在页面上覆盖)
        // 确保图片路径以你的网站 URL 开头，形成绝对路径
        { hid: 'og:image', property: 'og:image', content: 'https://img.ziuch.top/i/2025/05/03/siols5.png' },
        // 默认 OG URL (通常是页面的 URL，Nuxt 处理得很好，但设个默认值也无妨)
        { hid: 'og:url', property: 'og:url', content: 'https://xinyue.best' },

        // --- Twitter Card (用于 Twitter) ---
        { hid: 'twitter:card', name: 'twitter:card', content: 'summary_large_image' }, // 如果你的图片较小/方形，则使用 'summary'
         // 默认 Twitter 标题 (会被页面特定标题通过 titleTemplate 覆盖)
        { hid: 'twitter:title', name: 'twitter:title', content: '欣玥生日快乐' },
        // 默认 Twitter 描述 (应在每个页面上覆盖)
        { hid: 'twitter:description', name: 'twitter:description', content: '生日快乐！天天开心！欣玥就是最棒的~' },
         // 默认 Twitter 图片 (如果需要，可在页面上覆盖)
        // 确保图片路径以你的网站 URL 开头，形成绝对路径
        { hid: 'twitter:image', name: 'twitter:image', content: 'https://img.ziuch.top/i/2025/05/03/siols5.png' },
        // 可选: 如果你有 Twitter 账号，可以加上用户名
        // { name: 'twitter:site', content: '@你的Twitter用户名' },

        // --- 其他 Meta ---
         // 默认 robots 标签 (允许索引和跟随链接)
         // 你可能想通过 robots.txt 或页面级的 meta 标签来禁止特定页面被抓取
        { hid: 'robots', name: 'robots', content: 'index, follow' },
        { name: 'format-detection', content: 'telephone=no' }, // 防止移动设备自动将数字识别为电话号码链接
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        // 如果需要，添加其他 link 标签 (例如预连接 preconnect, 样式表 stylesheets)
        // 示例: 如果使用 Google Fonts，可以预连接
        // { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        // { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
      ]
    }
  },

  // --- 模块配置 ---

  // Sitemap 配置 (nuxt-simple-sitemap)
  // 确保你在上面设置了 `site.url` 或在此处定义 `siteUrl`
  // sitemap: {
  //   // 选项: https://nuxtseo.com/sitemap/getting-started/configuration
  //   // `siteUrl` 将会从上面定义的 `site.url` 推断出来
  //   // 如果需要，你可能想排除特定的路由
  //   // exclude: ['/admin/**'],
  // },

  // Robots 配置 (nuxt-simple-robots)
  // 选项: https://nuxtseo.com/robots/getting-started/configuration
  // robots: {
  //   // 默认情况下，它允许所有爬虫访问所有路径，并链接到你的 sitemap
  //   // 如果需要，可以在这里自定义规则：
  //   Disallow: ['/admin'], // 禁止访问 /admin 目录
  //   UserAgent: '*', // 对所有爬虫生效
  // },

  // 可选: Schema.org 配置 (nuxt-schema-org)
  // schemaOrg: {
  //   host: 'https://xinyue.best', // 你的生产环境 URL
  //   // 定义全站的默认结构化数据
  //   identity: {
  //     type: 'Person', // 或 'Organization' (组织)
  //     name: '欣玥', // 或你的网站名称
  //     url: 'https://xinyue.best',
  //   }
  // },

  vite: {
    server: {
      // 如果你的开发/部署环境需要，保留此项
      allowedHosts: ['xinyue.best']
    }
  }
})
