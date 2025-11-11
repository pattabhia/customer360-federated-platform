# Customer360 Federated Platform - Makefile
# Simplifies common development tasks

.PHONY: help install start stop test clean docker build deploy

# Default target - show help
help:
	@echo ""
	@echo "╔══════════════════════════════════════════════════════════╗"
	@echo "║   Customer360 Federated Platform - Commands             ║"
	@echo "╚══════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "📦 Setup Commands:"
	@echo "  make install              Install all dependencies"
	@echo "  make install-mock         Install mock API dependencies"
	@echo "  make install-gateway      Install gateway dependencies"
	@echo "  make install-subgraph     Install subgraph dependencies"
	@echo ""
	@echo "🚀 Start Commands:"
	@echo "  make start                Start ALL services"
	@echo "  make start-mock           Start mock APIs (port 5000)"
	@echo "  make start-gateway        Start Apollo Gateway (port 4000)"
	@echo "  make start-customer       Start Customer subgraph (port 4001)"
	@echo "  make dev                  Start all in development mode"
	@echo ""
	@echo "🛑 Stop Commands:"
	@echo "  make stop                 Stop all services"
	@echo "  make stop-mock            Stop mock APIs"
	@echo "  make stop-gateway         Stop gateway"
	@echo "  make stop-customer        Stop customer subgraph"
	@echo ""
	@echo "🧪 Test Commands:"
	@echo "  make test                 Run all tests"
	@echo "  make test-mock            Test mock APIs"
	@echo "  make test-gateway         Test gateway"
	@echo "  make test-customer        Test customer subgraph"
	@echo ""
	@echo "🔨 Build Commands:"
	@echo "  make build                Build all services"
	@echo "  make build-customer       Build customer subgraph"
	@echo "  make clean                Clean all build artifacts"
	@echo ""
	@echo "🐳 Docker Commands:"
	@echo "  make docker-build         Build all Docker images"
	@echo "  make docker-up            Start all services with Docker Compose"
	@echo "  make docker-down          Stop Docker services"
	@echo "  make docker-logs          View Docker logs"
	@echo ""
	@echo "📊 Utility Commands:"
	@echo "  make status               Check status of all services"
	@echo "  make logs                 View all logs"
	@echo "  make health               Check health of all services"
	@echo ""

# ============================================================================
# INSTALLATION COMMANDS
# ============================================================================

install: install-mock install-gateway
	@echo "✅ All dependencies installed!"

install-mock:
	@echo "📦 Installing mock API dependencies..."
	cd mock-legacy-systems && npm install
	@echo "✅ Mock API dependencies installed"

install-gateway:
	@echo "📦 Installing gateway dependencies..."
	cd gateway && npm install
	@echo "✅ Gateway dependencies installed"

install-subgraph:
	@echo "📦 Installing subgraph dependencies..."
	cd subgraphs/customer-profile-subgraph && mvn clean install -DskipTests
	@echo "✅ Subgraph dependencies installed"

# ============================================================================
# START COMMANDS
# ============================================================================

# Start all services (one by one)
start:
	@echo "🚀 Starting all services..."
	@echo ""
	@echo "⚠️  Note: Services will start in separate terminals"
	@echo "    Use 'make dev' for background mode"
	@echo ""
	@$(MAKE) start-mock &
	@sleep 3
	@$(MAKE) start-customer &
	@sleep 10
	@$(MAKE) start-gateway &
	@echo ""
	@echo "✅ All services started!"
	@echo "   • Mock APIs:   http://localhost:5000"
	@echo "   • Gateway:     http://localhost:4000/graphql"
	@echo "   • Customer:    http://localhost:4001/graphql"

# Start mock APIs
start-mock:
	@echo "🚀 Starting Mock APIs on port 5000..."
	cd mock-legacy-systems && npm start

# Start Apollo Gateway
start-gateway:
	@echo "🚀 Starting Apollo Gateway on port 4000..."
	cd gateway && npm start

# Start Customer Subgraph
start-customer:
	@echo "🚀 Starting Customer Subgraph on port 4001..."
	cd subgraphs/customer-profile-subgraph && mvn spring-boot:run

# Development mode (all in background)
dev:
	@echo "🔧 Starting all services in development mode..."
	cd mock-legacy-systems && npm start > /tmp/mock.log 2>&1 &
	@echo "  • Mock APIs starting... (logs: /tmp/mock.log)"
	@sleep 3
	cd subgraphs/customer-profile-subgraph && mvn spring-boot:run > /tmp/customer.log 2>&1 &
	@echo "  • Customer Subgraph starting... (logs: /tmp/customer.log)"
	@sleep 10
	cd gateway && npm start > /tmp/gateway.log 2>&1 &
	@echo "  • Gateway starting... (logs: /tmp/gateway.log)"
	@sleep 3
	@echo ""
	@echo "✅ All services running in background!"
	@echo "   View logs: make logs"
	@echo "   Stop all:  make stop"

# ============================================================================
# STOP COMMANDS
# ============================================================================

stop: stop-gateway stop-customer stop-mock
	@echo "🛑 All services stopped"

stop-mock:
	@echo "🛑 Stopping Mock APIs..."
	-@pkill -f "node.*mock-legacy-systems" || true
	-@lsof -ti:5000 | xargs kill -9 2>/dev/null || true

stop-gateway:
	@echo "🛑 Stopping Gateway..."
	-@pkill -f "node.*gateway" || true
	-@lsof -ti:4000 | xargs kill -9 2>/dev/null || true

stop-customer:
	@echo "🛑 Stopping Customer Subgraph..."
	-@pkill -f "customer-profile-subgraph" || true
	-@lsof -ti:4001 | xargs kill -9 2>/dev/null || true

# ============================================================================
# TEST COMMANDS
# ============================================================================

test: test-mock test-gateway test-customer
	@echo "✅ All tests passed!"

test-mock:
	@echo "🧪 Testing Mock APIs..."
	cd mock-legacy-systems && ./test-apis.sh

test-gateway:
	@echo "🧪 Testing Gateway..."
	cd gateway && ./test-gateway.sh

test-customer:
	@echo "🧪 Testing Customer Subgraph..."
	cd subgraphs/customer-profile-subgraph && ./test-endpoints.sh

# ============================================================================
# BUILD COMMANDS
# ============================================================================

build: build-customer
	@echo "✅ Build complete!"

build-customer:
	@echo "🔨 Building Customer Subgraph..."
	cd subgraphs/customer-profile-subgraph && mvn clean package -DskipTests
	@echo "✅ Customer Subgraph built successfully"

clean:
	@echo "🧹 Cleaning build artifacts..."
	cd subgraphs/customer-profile-subgraph && mvn clean
	rm -rf gateway/node_modules
	rm -rf mock-legacy-systems/node_modules
	rm -f /tmp/mock.log /tmp/gateway.log /tmp/customer.log
	@echo "✅ Clean complete"

# ============================================================================
# DOCKER COMMANDS
# ============================================================================

docker-build:
	@echo "🐳 Building Docker images..."
	docker-compose build
	@echo "✅ Docker images built"

docker-up:
	@echo "🐳 Starting services with Docker Compose..."
	docker-compose up -d
	@echo "✅ Services started in Docker"
	@echo "   View logs: make docker-logs"

docker-down:
	@echo "🐳 Stopping Docker services..."
	docker-compose down
	@echo "✅ Docker services stopped"

docker-logs:
	@echo "📋 Docker logs (Ctrl+C to exit):"
	docker-compose logs -f

# ============================================================================
# UTILITY COMMANDS
# ============================================================================

status:
	@echo "📊 Checking service status..."
	@echo ""
	@echo "Mock APIs (port 5000):"
	@curl -s http://localhost:5000/health > /dev/null 2>&1 && echo "  ✅ Running" || echo "  ❌ Not running"
	@echo ""
	@echo "Customer Subgraph (port 4001):"
	@curl -s http://localhost:4001/actuator/health > /dev/null 2>&1 && echo "  ✅ Running" || echo "  ❌ Not running"
	@echo ""
	@echo "Gateway (port 4000):"
	@curl -s http://localhost:4000/health > /dev/null 2>&1 && echo "  ✅ Running" || echo "  ❌ Not running"
	@echo ""

health:
	@echo "🏥 Health check for all services..."
	@echo ""
	@echo "Mock APIs:"
	@curl -s http://localhost:5000/health | jq '.' || echo "  ❌ Not responding"
	@echo ""
	@echo "Customer Subgraph:"
	@curl -s http://localhost:4001/actuator/health | jq '.' || echo "  ❌ Not responding"
	@echo ""
	@echo "Gateway:"
	@curl -s http://localhost:4000/health | jq '.' || echo "  ❌ Not responding"

logs:
	@echo "📋 Recent logs:"
	@echo ""
	@echo "=== Mock APIs ==="
	@tail -20 /tmp/mock.log 2>/dev/null || echo "No logs found"
	@echo ""
	@echo "=== Customer Subgraph ==="
	@tail -20 /tmp/customer.log 2>/dev/null || echo "No logs found"
	@echo ""
	@echo "=== Gateway ==="
	@tail -20 /tmp/gateway.log 2>/dev/null || echo "No logs found"

# ============================================================================
# QUICK COMMANDS (shortcuts)
# ============================================================================

# Quick start for development
quick-start: install dev
	@echo "🚀 Quick start complete!"
	@echo "   Gateway: http://localhost:4000/graphql"

# Full reset and restart
reset: stop clean install start
	@echo "♻️  Full reset complete!"

# Check if everything is working
check: status health test
	@echo "✅ All checks complete!"