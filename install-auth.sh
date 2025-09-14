#!/bin/bash

echo "Installing authentication dependencies for POS Dashboard..."

# Install axios
echo "Installing axios..."
npm install axios

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    echo "REACT_APP_API_URL=http://localhost:8000/api" > .env
    echo ".env file created with default API URL"
else
    echo ".env file already exists"
fi

echo "Installation complete!"
echo ""
echo "Next steps:"
echo "1. Update the REACT_APP_API_URL in .env to match your Laravel backend"
echo "2. Start your Laravel backend server"
echo "3. Run 'npm start' to start the React development server"
echo ""
echo "The authentication system is now ready to use!"
