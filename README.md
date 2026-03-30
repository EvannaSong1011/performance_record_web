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

## 一、创建 Supabase 数据库

1. 打开 [supabase.com](https://supabase.com)，注册或登录
2. 点击 **New Project**，选择区域（推荐选离你较近的），设置数据库密码（**务必记住**）
3. 项目创建完成后，进入左侧 **SQL Editor**
4. 将 `supabase-init.sql` 的内容粘贴进去，点击 **Run** 执行
5. 进入左侧 **Project Settings → Database**
6. 找到 **Connection string → URI**，选择 **Transaction Mode**（端口 6543）
7. 复制连接串，将其中的 `[YOUR-PASSWORD]` 替换为你在第 2 步设置的密码

连接串格式类似：
```
postgresql://postgres.[ref]:密码@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

---

## 二、推送代码到 GitHub

```bash
cd show-schedule-vercel
git init
git add .
git commit -m "init: vercel + supabase migration"
```

然后在 GitHub 创建一个新仓库，推送：

```bash
git remote add origin https://github.com/你的用户名/show-schedule.git
git branch -M main
git push -u origin main
```

---

## 三、部署到 Vercel

1. 打开 [vercel.com](https://vercel.com)，用 GitHub 账号登录
2. 点击 **Add New → Project**
3. 选择刚才推送的仓库，点击 **Import**
4. 在部署配置页面：
   - **Framework Preset**: 选 `Other`
   - **Root Directory**: 保持默认（`.`）
   - **Build Command**: 留空
   - **Output Directory**: 留空
5. 展开 **Environment Variables**，添加：
   - Key: `DATABASE_URL`
   - Value: 你在第一步获取的 Supabase 连接串
6. 点击 **Deploy**

部署完成后 Vercel 会给你一个域名（如 `show-schedule-xxx.vercel.app`），即可访问。

---

## 四、自定义域名（可选）

1. 在 Vercel 项目页面，进入 **Settings → Domains**
2. 添加你自己的域名
3. 按提示在你的 DNS 服务商添加 CNAME 记录

---

## 五、本地开发（可选）

```bash
# 安装依赖
npm install

# 复制 .env.example 为 .env.local 并填入真实的 DATABASE_URL
cp .env.example .env.local

# 安装 Vercel CLI 并启动本地开发服务器
npm i -g vercel
vercel dev
```

访问 `http://localhost:3000` 即可本地调试。

---

## 与原版的差异说明

| 项目 | 原版 | 新版 |
|------|------|------|
| 运行环境 | Docker + Node.js 长驻进程 | Vercel Serverless Functions |
| 数据库 | SQLite（本地文件） | Supabase PostgreSQL（云端） |
| 数据库字段 | `cast` | `cast_info`（避免 PostgreSQL 保留字冲突，前端无感知） |
| SQL 占位符 | `?` | `$1, $2, $3...` |
| 静态文件服务 | Express 手动 serve | Vercel 自动托管 `public/` |
| 前端代码 | 无变化 | 无变化（API 路径完全一致） |
=======
# performance_record_web
>>>>>>> 240b4b92d7b91f0a278720ee29e4be75336c917e
