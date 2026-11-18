# Magpie 网关生命周期

把 **Magpie 网关进程**的生命周期绑定到 DeepSeek Harness（DSH）宿主进程：DSH 打开 → 网关起来；DSH 关闭 → 网关一起退出。不装系统服务，也没有常驻守护进程，magpie 就是 DSH 宿主进程的子进程。

本 bundle 只是**安装壳**：真正的插件代码仍在 `D:\software\DSH\Extension\magpie-lifecycle`，`index.js` 用 `file:` URL 直接 re-export 那边，代码只有一份。这里只提供 profile 层的 patch 行和显示信息。

## 行为

| 时机 | 动作 |
| --- | --- |
| DSH 启动、`127.0.0.1:3425` 无人监听 | 拉起 `magpie.exe web --no-open --gateway`，pid 写入 `%DSH_HOME%\magpie-gateway.pid` |
| DSH 启动、3425 已被 magpie 占用 | 接管该进程（记录 pid），DSH 退出时一并结束 |
| DSH 启动、3425 被非 magpie 进程占用 | 完全不动，也不接管 |
| DSH 正常退出 | `taskkill /PID <pid> /T /F`，连同 magpie 派生的 `magpie-bun.exe` 一起收掉 |
| DSH 被强杀 / 崩溃 | 下次启动读 pid 文件，确认映像名仍是 magpie 后清理残留，避免孤儿进程占着 3425 |
| 任何异常 | 只打日志，绝不阻断 DSH 启动 |

日志前缀 `[magpie-gateway]`，随 DSH 宿主 stdout 输出。

## 当前安装的配置

```yaml
- insert:
    - id: magpie-gateway-lifecycle
      name: dsh-magpie-lifecycle
      config:
        exe: 'D:\software\Magpie\magpie.exe'
        args: [web, --no-open, --gateway]
        host: 127.0.0.1
        port: 3425
        startupTimeoutMs: 60000
        adoptExisting: true
        stopOnExit: true
```

- `exe` 已按本机路径填写（插件内置默认值是 `E:\Magpie\App\magpie.exe`，本机不存在）。
- `args` 改成 `[web]` 会带界面并弹浏览器。
- `adoptExisting: false` 表示只认自己启动的进程，不接管别人开的 magpie。
- `stopOnExit: false` 退回“退出不管 magpie”的旧行为。

## 限制

- 仅 Windows：依赖 `tasklist` / `netstat` / `taskkill`。
- 只有在 3425 端口空闲时才会真正启动 magpie；端口被别的程序占着时只记日志。
- 改 `cordis.patch.yml` 会热加载；改 `Extension\magpie-lifecycle\index.js` 后需要重启 DSH 才会重新 import。
