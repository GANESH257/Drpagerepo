#!/bin/bash

# Kill all Node.js processes
echo "Killing all Node.js processes..."
killall -9 node 2>/dev/null
killall -9 next 2>/dev/null

# Kill processes on ports 3000 and 3001
echo "Clearing ports 3000 and 3001..."
lsof -ti:3001 2>/dev/null | xargs kill -9 2>/dev/null
lsof -ti:3000 2>/dev/null | xargs kill -9 2>/dev/null

# Kill any remaining Next.js processes
pkill -f "next dev" 2>/dev/null
pkill -f "next start" 2>/dev/null

sleep 2
echo "✅ All processes killed!"
echo ""
echo "Now you can run: npm run dev"
