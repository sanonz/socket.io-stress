## 介绍

本项目有 socket.io 服务脚本与测试脚本，服务脚本支持实时统计服务器 CPU、内存占用以及 socket 连接数量等，测试脚本可以自定义设置连接数量进行压力测试。

## 使用

下载

```bash
$ git clone git@github.com:sanonz/socket.io-stress.git
$ cd socket.io-stress
```

启动 socket.io 服务

```bash
$ npm install
$ npm start
```

测试 socket.io，默认是创建 500 个 socket 连接，可自行修改

```bash
$ node run ./stress.js 500
```

打开 [http://localhost:3000](http://localhost:3000) 可以实时查看服务器统计信息

## 问题

测试脚本我目前测试的单个进程最大只能创建 7800 个左右的 socket 连接，目前利用 nodejs 的 Cluster（集群）实现了更多的连接，具体的数量根据电脑的配置而定。
