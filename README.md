# 告白怪谈：秋清与月兰山

一个静态互动叙事网页，使用 HTML/CSS/JavaScript 实现，Docker 中通过 Nginx 服务。

## 本地运行

```powershell
python -m http.server 4173
```

打开 `http://127.0.0.1:4173`。

## Docker

```powershell
docker build -t qiuqing-yuelanshan .
docker run -d --name qiuqing-yuelanshan -p 80:80 `
  -e ADMIN_USERNAME=admin `
  -e ADMIN_PASSWORD=admin `
  -v qiuqing-yuelanshan-data:/usr/src/app/data `
  -v qiuqing-yuelanshan-uploads:/usr/src/app/uploads `
  qiuqing-yuelanshan
```

后台新建故事、发布状态、编辑覆盖和上传媒体分别写入容器内的 `/usr/src/app/data` 与 `/usr/src/app/uploads`。生产部署必须把这两个目录挂载成 Docker volume 或宿主机目录，否则重新创建容器会丢失后台数据；普通 `docker restart` 会保留挂载数据。
公开源码默认后台账号密码为 `admin/admin`；正式部署时请通过环境变量改成你自己的值，或用 `ADMIN_PASSWORD_SALT`/`ADMIN_PASSWORD_HASH` 提供哈希口令。

## 资源说明

视觉资源由 `scripts/generate_assets.py` 在本地生成并保存到 `assets/images`。

音频为 CC0 资源：
- Mysterious ambience by EntoClash: https://freesound.org/people/EntoClash/sounds/728725/
- Page Turn by qubodup: https://freesound.org/people/qubodup/sounds/442857/
- Notification Sound 1 by deadrobotmusic: https://freesound.org/people/deadrobotmusic/sounds/750607/
