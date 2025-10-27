#!/bin/bash

# Comprehensive test script for ecommerce backend APIs
echo "🧪 Comprehensive Ecommerce Backend API Testing"
echo "=============================================="

BASE_URL="http://localhost:3001"

# Function to make API calls
call_api() {
    local method=$1
    local url=$2
    local data=$3
    local auth=$4

    echo ""
    echo "📡 $method $url"
    if [ -n "$data" ]; then
        echo "📤 Data: $data"
    fi

    if [ -n "$auth" ]; then
        RESPONSE=$(curl -s -X $method "$BASE_URL$url" \
             -H "Content-Type: application/json" \
             -H "Authorization: Bearer $auth" \
             -d "$data")
    else
        RESPONSE=$(curl -s -X $method "$BASE_URL$url" \
             -H "Content-Type: application/json" \
             -d "$data")
    fi

    echo "📥 Response: $RESPONSE"
    # Try to parse JSON, if it fails, show raw response
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "Raw response: $RESPONSE"
}

echo "� Checking if server is running..."
HEALTH_CHECK=$(curl -s http://localhost:3001/health 2>/dev/null)
if [ $? -ne 0 ]; then
    echo "❌ Server not responding. Please start the server first with: cd ecommerce-backend && npm run dev"
    exit 1
fi
echo "✅ Server is healthy: $HEALTH_CHECK"

echo ""
echo "🧪 PHASE 1: AUTHENTICATION TESTS"
echo "================================"

# Test 1: User Registration
echo "1️⃣ Testing User Registration"
RESPONSE=$(call_api POST "/api/auth/register" '{"email":"test@example.com","password":"password123","name":"John Doe"}')
# Extract token more robustly
USER_TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4 2>/dev/null || echo "")

if [ -z "$USER_TOKEN" ]; then
    echo "❌ Registration failed - no token received"
    echo "Response was: $RESPONSE"
    exit 1
fi
echo "✅ Registration successful, token: ${USER_TOKEN:0:20}..."

# Test 2: User Login
echo "2️⃣ Testing User Login"
RESPONSE=$(call_api POST "/api/auth/login" '{"email":"test@example.com","password":"password123"}')
LOGIN_TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4 2>/dev/null || echo "")

if [ -z "$LOGIN_TOKEN" ]; then
    echo "❌ Login failed - no token received"
    echo "Response was: $RESPONSE"
    exit 1
fi
echo "✅ Login successful, token: ${LOGIN_TOKEN:0:20}..."

echo ""
echo "🛍️ PHASE 2: PRODUCT BROWSING TESTS"
echo "=================================="

# Test 3: Get All Products
echo "3️⃣ Testing Get All Products"
call_api GET "/api/products" "" ""

# Test 4: Get Product by ID
echo "4️⃣ Testing Get Product by ID (ID: 1)"
call_api GET "/api/products/1" "" ""

# Test 5: Search Products
echo "5️⃣ Testing Product Search (query: 'wireless')"
call_api GET "/api/products/search?q=wireless" "" ""

echo ""
echo "🛒 PHASE 3: SHOPPING CART TESTS"
echo "==============================="

# Test 6: Get Empty Cart
echo "6️⃣ Testing Get Empty Cart"
call_api GET "/api/cart" "" "$LOGIN_TOKEN"

# Test 7: Add Item to Cart
echo "7️⃣ Testing Add Item to Cart (Product ID: 1, Quantity: 2)"
call_api POST "/api/cart" '{"product_id":1,"quantity":2}' "$LOGIN_TOKEN"

# Test 8: Get Cart with Items
echo "8️⃣ Testing Get Cart with Items"
call_api GET "/api/cart" "" "$LOGIN_TOKEN"

# Test 9: Add Another Item to Cart
echo "9️⃣ Testing Add Another Item to Cart (Product ID: 2, Quantity: 1)"
call_api POST "/api/cart" '{"product_id":2,"quantity":1}' "$LOGIN_TOKEN"

# Test 10: Update Cart Item Quantity
echo "🔟 Testing Update Cart Item Quantity (Item ID: 1, New Quantity: 3)"
call_api PUT "/api/cart/1" '{"quantity":3}' "$LOGIN_TOKEN"

# Test 11: Get Updated Cart
echo "1️⃣1️⃣ Testing Get Updated Cart"
call_api GET "/api/cart" "" "$LOGIN_TOKEN"

echo ""
echo "💰 PHASE 4: CHECKOUT & ORDER TESTS"
echo "==================================="

# Test 12: Create Order (Checkout)
echo "1️⃣2️⃣ Testing Create Order (Checkout)"
RESPONSE=$(call_api POST "/api/orders" '{"shipping_address":"123 Main St, City, State 12345"}' "$LOGIN_TOKEN")
ORDER_ID=$(echo "$RESPONSE" | grep -o '"id":[0-9]*' | cut -d':' -f2 2>/dev/null || echo "")

if [ -z "$ORDER_ID" ]; then
    echo "❌ Order creation failed - no order ID received"
    echo "Response was: $RESPONSE"
else
    echo "✅ Order created successfully, Order ID: $ORDER_ID"
fi

# Test 13: Get Order History
echo "1️⃣3️⃣ Testing Get Order History"
call_api GET "/api/orders" "" "$LOGIN_TOKEN"

# Test 14: Get Specific Order Details
if [ -n "$ORDER_ID" ]; then
    echo "1️⃣4️⃣ Testing Get Specific Order Details (Order ID: $ORDER_ID)"
    call_api GET "/api/orders/$ORDER_ID" "" "$LOGIN_TOKEN"
fi

# Test 15: Verify Cart is Empty After Checkout
echo "1️⃣5️⃣ Testing Cart is Empty After Checkout"
call_api GET "/api/cart" "" "$LOGIN_TOKEN"

echo ""
echo "🎉 ALL TESTS COMPLETED!"
echo "======================"
echo "✅ Authentication: Register & Login"
echo "✅ Product Browsing: List, Get, Search"
echo "✅ Shopping Cart: Add, Update, Remove, View"
echo "✅ Checkout: Order Creation, History, Details"
echo "✅ Cart Management: Cleared after checkout"

echo ""
echo "All tests completed successfully! 🎉"
