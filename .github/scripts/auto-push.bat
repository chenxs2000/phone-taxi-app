@echo off
chcp 65001 >nul
echo =======================================
echo Phone Taxi App - 自动化推送工具
echo =======================================
echo.
echo 请按照以下步骤操作：
echo.
echo 步骤 1: 创建 GitHub Personal Access Token
echo.
echo 1. 访问: https://github.com/settings/tokens
echo 2. 点击 "Generate new token (classic)"
echo 3. 配置:
echo    - Note: Phone Taxi App Full Access
echo    - Expiration: 90 days
echo    - 权限:
echo      ✓ repo (全部)
echo      ✓ workflow
echo      ✓ write:packages
echo 4. 复制 Token（只显示一次）
echo.

set /p TOKEN="请输入您的 PAT: "

if "%TOKEN%"=="" (
    echo [错误] Token 不能为空
    pause
    exit /b 1
)

echo.
echo [信息] Token 已接收
echo.

cd /d C:\Users\chenx\phone-taxi-app

echo [信息] 配置 Git 凭据...
git config --local credential.helper store

set USERNAME=chenxs2000
set BRANCH=test-ci-cd

echo [信息] 用户: %USERNAME%
echo [信息] 分支: %BRANCH%
echo.

echo url=https://github.com > %USERPROFILE%\.git-credentials-temp
echo username=%USERNAME% >> %USERPROFILE%\.git-credentials-temp
echo password=%TOKEN% >> %USERPROFILE%\.git-credentials-temp

git credential-store --file %USERPROFILE%\.git-credentials-temp store

del %USERPROFILE%\.git-credentials-temp

echo [成功] 凭据已配置
echo.

echo [信息] 推送代码到 GitHub...
echo [警告] 使用强制推送...
echo.

git push -f origin %BRANCH%

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [成功] 推送成功！
    echo.
    echo GitHub Actions 页面:
    echo https://github.com/chenxs2000/phone-taxi-app/actions
    echo.
    echo 参考监控指南:
    echo .github/CI-CD-MONITORING-GUIDE.md
    echo.
    echo [信息] 清理凭据存储...
    if exist %USERPROFILE%\.git-credentials (
        del %USERPROFILE%\.git-credentials
        echo [成功] 凭据已清理
    )
) else (
    echo.
    echo [错误] 推送失败
    echo.
    echo 请检查:
    echo   1. Token 权限是否正确（repo + workflow + write:packages）
    echo   2. Token 是否已复制完整
    echo   3. 网络连接是否正常
    echo.
    if exist %USERPROFILE%\.git-credentials (
        del %USERPROFILE%\.git-credentials
        echo [信息] 凭据已清理
    )
)

pause
