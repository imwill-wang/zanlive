# ZanLive 项目说明

本项目是一个直播与社交消息相关的多工程仓库，包含：



## 目录内容

```text
├─ README.md
├─ doc/  					# 项目文档、SQL、接口说明、设计资料
├─ zanlive-client-uniapp/   # App客户端
├─ zanlive-im-web/			# 桌面客户端
├─ zanlive-publish/			# 静态下载发布页
└─ zanlive-server-java/     # 服务端
 
```

## 环境要求

建议准备以下环境：

- JDK 17
- MySQL 8.x
- Redis 6.x 或 7.x
- Node.js 18+
- HBuilderX 5.x
- SRS 	https://ossrs.net/lts 


## 一、后端部署

## 1. 数据库准备

先创建业务数据库，执行doc/sql 


## 2. Redis 准备

默认配置使用本地 Redis：

- Host：`127.0.0.1`
- Port：`6379`

请确保 Redis 已启动，并与配置文件中指定的 database 编号一致。

## 3. 启动 `api-server`
1修改配置参数
2启动：
```bash
servic.sh start
```
 
默认端口：
- HTTP：`8080`
- App 消息端口：`8090`
- WebSocket：`8070`
- Live WebSocket：`8071`


## 4. 启动 `admin-server`

进入目录：

```bash
cd zanlive-server-java/admin-server
```

1修改配置参数
2启动：
```bash
servic.sh start
```

默认端口：
- `8081`

注意：

- `admin-server` 依赖 `api-server`
- 必须先保证 `api-server` 已可访问

## 二、前端部署

## 1. App 客户端 `zanlive-client-uniapp`
 

## 2. Web IM `zanlive-im-web`  
纯静态页面

 
## 3. 下载页 `zanlive-publish`

这是一个纯静态页面，可直接部署到 Nginx、OSS、静态站点平台或任意 Web 服务器。

部署方式：

- 将 `zanlive-publish` 目录整体发布到站点根目录
- 确保 `download/zanlive.apk` 路径与配置一致

## 三、如何修改配置

## 1. `api-server` 配置文件


### 数据库

```properties
spring.datasource.url=
spring.datasource.username=
spring.datasource.password=
```

### Redis

```properties
spring.data.redis.host=
spring.data.redis.port=
spring.data.redis.database=
```

### HTTP 与消息端口

```properties
server.port=8080
messaging.app.port=8090
messaging.websocket.port=8070
messaging.live-websocket.port=8071
```

### 文件上传与访问地址

```properties
bogo.upload.file.endpoint=
bogo.file.local.enable=true
bogo.file.oss.enable=false
```


## 2. `admin-server` 配置文件

关键配置项：

### 数据库

```properties
spring.datasource.url=
spring.datasource.username=
spring.datasource.password=
```

### Redis

```properties
spring.data.redis.host=
spring.data.redis.port=
spring.data.redis.database=
```

### 后台管理员账号

```properties
sys.manager.account=
sys.manager.password=
sys.manager.name=
```

### Boot 服务地址

```properties
boot.server.endpoint=http://127.0.0.1:8080
```

### 直播推流前缀

```properties
bogo.live.anchor.stream-prefix=
```

## 3. App 客户端配置

主要文件：

- `zanlive-client-uniapp/services/http.ts`
- `zanlive-client-uniapp/pages.json`
- `zanlive-client-uniapp/manifest.json`

最重要的接口基地址：

```ts
const BASE_URL = 'http://localhost:8080'
```


## 4. Web IM 配置

siteinfo.config.js

如果 使用反向代理部署，建议统一通过网关域名转发 API 与 WS。
参考:
```

# api 代理配置
location /api/ {
    proxy_pass http://127.0.0.1:8080/; # 指向你的 api服务
    
    # 传递客户端真实信息
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  
}

# WebSocket 代理配置
location /ws-api/ {
    proxy_pass http://127.0.0.1:8070/; # 指向你的 ws 服务
    
    # 核心三行：支持 HTTP 升级到 WebSocket
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    
    # 传递客户端真实信息
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    
    # 超时设置（WebSocket是长连接，必须调大，默认60秒会断开）
    proxy_read_timeout 3600s; 
    proxy_send_timeout 3600s;
}
```

## 5. 下载页配置

主要文件：

- `zanlive-publish/config.js`

可修改项：

```js
window.APP_PUBLISH_CONFIG = {
  appName: 'ZanLive',
  tagline: '精彩直播，随时互动',
  version: '1.0.4',
  androidApkUrl: '/download/zanlive.apk',
  iosAppStoreUrl: '',
  comingSoonMessage: 'Not yet published. Stay tuned.',
};
```
 