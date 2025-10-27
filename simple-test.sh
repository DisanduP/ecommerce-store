#!/bin/bash

echo "Starting server..."
cd /Users/disandup/Desktop/BMAD\ Test\ Run/Untitled/ecommerce-backend
node dist/app.js &
SERVER_PID=$!

echo "Waiting for server to start..."
sleep 3

echo "Testing health endpoint..."
curl -s http://localhost:3001/health

echo ""
echo "Testing registration..."
curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"John Doe"}'

echo ""
echo "Killing server..."
kill $SERVER_PID
wait $SERVER_PID 2>/dev/null

echo "Test complete."
