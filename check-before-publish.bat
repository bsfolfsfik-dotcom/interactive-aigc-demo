@echo off
chcp 65001 >nul
echo 🔍 开始检查项目...
echo.

set ERRORS=0
set WARNINGS=0

:: 1. 检查 .env.local
echo 📋 检查 1: .env.local 文件...
git ls-files --error-unmatch .env.local >nul 2>&1
if %errorlevel% equ 0 (
    echo ❌ 错误: .env.local 在 git 追踪中！
    echo    执行: git rm --cached .env.local
    set /a ERRORS+=1
) else (
    echo ✅ .env.local 不在 git 追踪中
)
echo.

:: 2. 检查必需文件
echo 📋 检查 2: 必需文件...
if exist README.md (echo ✅ README.md 存在) else (echo ❌ README.md 缺失 & set /a ERRORS+=1)
if exist LICENSE (echo ✅ LICENSE 存在) else (echo ❌ LICENSE 缺失 & set /a ERRORS+=1)
if exist .gitignore (echo ✅ .gitignore 存在) else (echo ❌ .gitignore 缺失 & set /a ERRORS+=1)
if exist .env.example (echo ✅ .env.example 存在) else (echo ❌ .env.example 缺失 & set /a ERRORS+=1)
if exist package.json (echo ✅ package.json 存在) else (echo ❌ package.json 缺失 & set /a ERRORS+=1)
echo.

:: 3. 检查 .gitignore 内容
echo 📋 检查 3: .gitignore 配置...
findstr /C:"node_modules" .gitignore >nul 2>&1
if %errorlevel% equ 0 (echo ✅ node_modules 在 .gitignore 中) else (echo ❌ node_modules 不在 .gitignore 中 & set /a ERRORS+=1)

findstr /C:".next" .gitignore >nul 2>&1
if %errorlevel% equ 0 (echo ✅ .next 在 .gitignore 中) else (echo ❌ .next 不在 .gitignore 中 & set /a ERRORS+=1)

findstr /C:".env" .gitignore >nul 2>&1
if %errorlevel% equ 0 (echo ✅ .env 在 .gitignore 中) else (echo ❌ .env 不在 .gitignore 中 & set /a ERRORS+=1)
echo.

:: 4. 检查 node_modules
echo 📋 检查 4: node_modules...
if exist node_modules (
    echo ✅ node_modules 存在
) else (
    echo ⚠️  node_modules 不存在，记得运行 npm install
    set /a WARNINGS+=1
)
echo.

:: 总结
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 📊 检查完成！
echo.

if %ERRORS% equ 0 (
    if %WARNINGS% equ 0 (
        echo 🎉 所有检查通过！可以安全发布。
        echo.
        echo 下一步：
        echo   1. git init
        echo   2. git add .
        echo   3. git commit -m "Initial commit: Interactive AIGC Demo"
        echo   4. git branch -M main
        echo   5. git remote add origin https://github.com/your-username/interactive-aigc-demo.git
        echo   6. git push -u origin main
    ) else (
        echo ⚠️  有 %WARNINGS% 个警告，建议修复后再发布。
    )
) else (
    echo ❌ 发现 %ERRORS% 个错误，必须修复后才能发布！
    if %WARNINGS% gtr 0 echo ⚠️  有 %WARNINGS% 个警告
)
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
pause
