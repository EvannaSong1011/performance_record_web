<<<<<<< HEAD
# 观演日程记录 — Vercel + Supabase 部署指南

## 项目结构

```
show-schedule-vercel/
├── public/                     ← 静态前端文件（Vercel 自动托管）
│   ├── index.html              ← 主页面（原 schedule.html）
│   └── styles/
│       └── main.css
├── api/                        ← Vercel Serverless Functions
│   ├── _db.js                  ← PostgreSQL 连接池（不会被路由）
│   ├── _auth.js                ← 认证工具函数（不会被路由）
│   ├── me.js                   ← GET  /api/me
│   ├── login.js                ← POST /api/login
│   ├── logout.js               ← POST /api/logout
│   ├── types.js                ← GET  /api/types
│   └── records/
│       ├── index.js            ← GET+POST /api/records
│       └── [id].js             ← PUT /api/records/:id
├── supabase-init.sql           ← 数据库建表脚本
├── vercel.json                 ← Vercel 路由配置
├── package.json
├── .env.example
└── .gitignore
```

> `api/` 下以 `_` 开头的文件不会被 Vercel 注册为 API 路由，适合放共享模块。

---

>>>>>>> 240b4b92d7b91f0a278720ee29e4be75336c917e
