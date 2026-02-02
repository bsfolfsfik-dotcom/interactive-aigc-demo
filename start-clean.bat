@echo off
echo 🧹 清理旧的 Next.js 进程...

:: 查找并关闭占用 3000-3010 端口的进程
for /L %%i in (3000,1,3010) do (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%%i.*LISTENING"') do (
        if not "%%a"=="0" (
            echo 关闭端口 %%i 的进程 (PID: %%a)
            taskkill //F //PID %%a >nul 2>&1
        )
    )
)

echo.
echo ✅ 清理完成！
echo 🚀 启动开发服务器...
echo.

npm run dev
