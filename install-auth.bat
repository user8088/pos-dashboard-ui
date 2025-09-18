@echo off
echo Installing authentication dependencies for POS Dashboard...

echo Installing axios...
npm install axios

if not exist .env (
    echo Creating .env file...
    echo REACT_APP_API_URL=https://server.mughalsupplier.com > .env
    echo .env file created with default API URL
) else (
    echo .env file already exists
)

echo Installation complete!
echo.
echo Next steps:
echo 1. Update the REACT_APP_API_URL in .env to match your Laravel backend
echo 2. Start your Laravel backend server
echo 3. Run 'npm start' to start the React development server
echo.
echo The authentication system is now ready to use!
pause
