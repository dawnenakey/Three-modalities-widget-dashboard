#!/bin/bash
# Start PIVOT backend locally for testing

set -e

echo "🚀 Starting PIVOT Backend for Local Testing"
echo "============================================"

cd "$(dirname "$0")/backend"

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  WARNING: backend/.env not found!"
    echo "The server may not start without environment variables."
    echo ""
fi

# Check if dependencies are installed
echo "🔍 Checking dependencies..."
if ! python3 -c "import fastapi, motor, boto3" 2>/dev/null; then
    echo "❌ Missing dependencies. Installing..."
    python3 -m pip install --user -r requirements.txt
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies OK"
fi

echo ""
echo "📝 Starting server on http://localhost:8001"
echo "   Press Ctrl+C to stop"
echo ""
echo "💡 Test endpoints:"
echo "   - http://localhost:8001/api/"
echo "   - http://localhost:8001/docs (API documentation)"
echo ""

# Start the server
python3 -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload

