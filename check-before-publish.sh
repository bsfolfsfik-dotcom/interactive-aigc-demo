#!/bin/bash

# 🚀 GitHub 发布前自动检查脚本

echo "🔍 开始检查项目..."
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查计数
ERRORS=0
WARNINGS=0

# 1. 检查 .env.local 是否会被提交
echo "📋 检查 1: .env.local 文件..."
if git ls-files --error-unmatch .env.local 2>/dev/null; then
    echo -e "${RED}❌ 错误: .env.local 在 git 追踪中！${NC}"
    echo "   执行: git rm --cached .env.local"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ .env.local 不在 git 追踪中${NC}"
fi
echo ""

# 2. 检查是否有硬编码的密钥
echo "📋 检查 2: 搜索硬编码的密钥..."
if grep -r "sk-ant-" pages/ lib/ 2>/dev/null | grep -v node_modules; then
    echo -e "${RED}❌ 发现 Anthropic API 密钥！${NC}"
    ERRORS=$((ERRORS + 1))
fi

if grep -r "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" pages/ lib/ 2>/dev/null | grep -v node_modules; then
    echo -e "${RED}❌ 发现 Supabase JWT 密钥！${NC}"
    ERRORS=$((ERRORS + 1))
fi

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ 未发现硬编码的密钥${NC}"
fi
echo ""

# 3. 检查 console.log
echo "📋 检查 3: 搜索 console.log..."
CONSOLE_COUNT=$(grep -r "console.log" pages/ lib/ 2>/dev/null | grep -v node_modules | wc -l)
if [ $CONSOLE_COUNT -gt 0 ]; then
    echo -e "${YELLOW}⚠️  发现 $CONSOLE_COUNT 个 console.log${NC}"
    echo "   建议移除或使用条件日志"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✅ 未发现 console.log${NC}"
fi
echo ""

# 4. 检查必需文件
echo "📋 检查 4: 必需文件..."
REQUIRED_FILES=("README.md" "LICENSE" ".gitignore" ".env.example" "package.json")
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file 存在${NC}"
    else
        echo -e "${RED}❌ $file 缺失${NC}"
        ERRORS=$((ERRORS + 1))
    fi
done
echo ""

# 5. 检查 node_modules
echo "📋 检查 5: node_modules..."
if [ -d "node_modules" ]; then
    if grep -q "node_modules" .gitignore; then
        echo -e "${GREEN}✅ node_modules 在 .gitignore 中${NC}"
    else
        echo -e "${RED}❌ node_modules 不在 .gitignore 中！${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${YELLOW}⚠️  node_modules 不存在，记得运行 npm install${NC}"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# 6. 检查 .next
echo "📋 检查 6: .next 构建目录..."
if grep -q ".next" .gitignore; then
    echo -e "${GREEN}✅ .next 在 .gitignore 中${NC}"
else
    echo -e "${RED}❌ .next 不在 .gitignore 中！${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 总结
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 检查完成！"
echo ""
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 所有检查通过！可以安全发布。${NC}"
    echo ""
    echo "下一步："
    echo "  1. git add ."
    echo "  2. git commit -m 'Initial commit'"
    echo "  3. git remote add origin <your-repo-url>"
    echo "  4. git push -u origin main"
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  有 $WARNINGS 个警告，建议修复后再发布。${NC}"
else
    echo -e "${RED}❌ 发现 $ERRORS 个错误，必须修复后才能发布！${NC}"
    echo -e "${YELLOW}⚠️  有 $WARNINGS 个警告${NC}"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
