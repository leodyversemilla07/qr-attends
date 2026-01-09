@echo off
REM =============================================================================
REM QR Attends - Convex Environment Switcher
REM =============================================================================
REM Switch between Development and Production Convex deployments

echo.
echo ============================================
echo   Convex Environment Switcher
echo ============================================
echo.
echo 1. Use Development (local dev server)
echo 2. Use Production (live deployment)
echo.
set /p choice="Enter choice (1-2): "

if "%choice%"=="1" goto dev
if "%choice%"=="2" goto prod
echo Invalid choice!
goto end

:dev
echo.
echo ============================================
echo   Switching to DEVELOPMENT Environment
echo ============================================
echo.
echo Dev URL: http://127.0.0.1:8181
echo.
echo Run: npx convex dev
echo Then: npx expo start
echo.
goto end

:prod
echo.
echo ============================================
echo   Switching to PRODUCTION Environment
echo ============================================
echo.
echo Production URL: https://glorious-axolotl-616.convex.cloud
echo.
echo To deploy functions to production:
echo   npx convex deploy
echo.
echo Then build the app:
echo   eas build --platform android
echo.
:end
pause
