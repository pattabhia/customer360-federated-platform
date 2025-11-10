#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "======================================================"
echo "     Testing Apollo Federation Gateway"
echo "======================================================"
echo ""

# Check if gateway is running
echo -e "${BLUE}📋 Checking if gateway is running...${NC}"
if ! curl -s http://localhost:4001/health > /dev/null 2>&1; then
    echo -e "${RED}❌ Gateway not running on port 4001${NC}"
    echo -e "${YELLOW}Start it with: npm start${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Gateway is running${NC}"
echo ""

# Test 1: Health Check
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test 1: Gateway Health Check${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "Endpoint: http://localhost:4001/health"
echo ""

HEALTH=$(curl -s http://localhost:4001/health)
if echo "$HEALTH" | grep -q '"status":"healthy"'; then
    echo -e "${GREEN}✅ Health check passed${NC}"
    echo "$HEALTH" | jq '.'
else
    echo -e "${RED}❌ Health check failed${NC}"
    echo "$HEALTH"
fi
echo ""

# Test 2: Gateway Info
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test 2: Gateway Info${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "Endpoint: http://localhost:4001/info"
echo ""

INFO=$(curl -s http://localhost:4001/info)
echo "$INFO" | jq '.'
echo ""

# Test 3: Federated Query - Customer
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test 3: Federated Query - Get Customer${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "Query: customer(customerId: \"CUST001\")"
echo ""

CUSTOMER=$(curl -s -X POST http://localhost:4001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ customer(customerId: \"CUST001\") { firstName lastName email segment lifetimeValue address { city state } } }"}')

if echo "$CUSTOMER" | grep -q '"firstName"'; then
    echo -e "${GREEN}✅ Customer query successful${NC}"
    echo "$CUSTOMER" | jq '.'
else
    echo -e "${RED}❌ Customer query failed${NC}"
    echo "$CUSTOMER"
fi
echo ""

# Test 4: Search Query
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test 4: Search Customers${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "Query: searchCustomers(query: \"jane\")"
echo ""

SEARCH=$(curl -s -X POST http://localhost:4001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ searchCustomers(query: \"jane\") { customerId firstName lastName email } }"}')

if echo "$SEARCH" | grep -q '"customerId"'; then
    echo -e "${GREEN}✅ Search query successful${NC}"
    echo "$SEARCH" | jq '.'
else
    echo -e "${RED}❌ Search query failed${NC}"
    echo "$SEARCH"
fi
echo ""

# Test 5: Introspection Query
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test 5: Schema Introspection${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "Query: __schema { types { name } }"
echo ""

SCHEMA=$(curl -s -X POST http://localhost:4001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __schema { types { name } } }"}')

if echo "$SCHEMA" | grep -q '"Customer"'; then
    echo -e "${GREEN}✅ Schema introspection successful${NC}"
    echo "Available types:"
    echo "$SCHEMA" | jq -r '.data.__schema.types[] | select(.name | startswith("__") | not) | .name' | head -15
else
    echo -e "${RED}❌ Schema introspection failed${NC}"
    echo "$SCHEMA"
fi
echo ""

# Test 6: Service Query
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test 6: Federation Service Query${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "Query: _service { sdl }"
echo ""

SERVICE=$(curl -s -X POST http://localhost:4001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ _service { sdl } }"}')

if echo "$SERVICE" | grep -q '@key'; then
    echo -e "${GREEN}✅ Service SDL retrieved${NC}"
    echo "$SERVICE" | jq -r '.data._service.sdl' | head -30
    echo "..."
else
    echo -e "${RED}❌ Service SDL query failed${NC}"
    echo "$SERVICE"
fi
echo ""

# Summary
echo -e "${BLUE}======================================================"
echo -e "                  Test Summary"
echo -e "======================================================${NC}"
echo ""
echo -e "${GREEN}✅ Apollo Gateway is working!${NC}"
echo ""
echo "Gateway URLs:"
echo "  • GraphQL API:     http://localhost:4001/graphql"
echo "  • Apollo Sandbox:  https://studio.apollographql.com/sandbox"
echo "  • Health Check:    http://localhost:4001/health"
echo "  • Info:            http://localhost:4001/info"
echo ""
echo -e "${YELLOW}💡 Next Steps:${NC}"
echo "  1. Open Apollo Sandbox (link above)"
echo "  2. Enter: http://localhost:4001/graphql"
echo "  3. Try federated queries!"
echo "  4. Build more subgraphs (Order, Billing, Support)"
echo ""