.PHONY: help install dev build start clean test lint format db-init db-reset docker-build docker-run docker-stop docker-logs applet-dev applet-build applet-install applet-uninstall

# Default target - show help
help:
	@echo "TrackIt - Time Tracking Application"
	@echo ""
	@echo "Available commands:"
	@echo "  make install    - Install all dependencies"
	@echo "  make dev        - Start development server"
	@echo "  make build      - Build for production"
	@echo "  make start      - Start production server"
	@echo "  make clean      - Remove node_modules and build artifacts"
	@echo "  make test       - Run tests (if configured)"
	@echo "  make lint       - Run linter"
	@echo "  make format     - Format code with prettier"
	@echo "  make db-init    - Initialize the database"
	@echo "  make db-reset   - Reset the database (WARNING: deletes all data)"
	@echo "  make docker-build - Build Docker image"
	@echo "  make docker-run   - Run application in Docker"
	@echo "  make docker-stop  - Stop Docker container"
	@echo ""
	@echo "Menu bar applet commands:"
	@echo "  make applet-dev       - Run menu bar applet in development mode"
	@echo "  make applet-build     - Build menu bar applet (.app bundle)"
	@echo "  make applet-install   - Build and install applet to ~/Applications"
	@echo "  make applet-uninstall - Remove applet from ~/Applications"
	@echo ""

# Install dependencies
install:
	@echo "Installing dependencies..."
	npm install
	@echo "✓ Dependencies installed"

# Start development server
dev:
	@echo "Starting development server..."
	npm run dev

# Build for production
build:
	@echo "Building for production..."
	npm run build
	@echo "✓ Build complete"

# Start production server
start: build
	@echo "Starting production server..."
	npm start

# Clean build artifacts and dependencies
clean:
	@echo "Cleaning build artifacts..."
	rm -rf .next
	rm -rf node_modules
	rm -rf out
	@echo "✓ Clean complete"

# Run tests
test:
	@echo "Running tests..."
	npm test

# Run linter
lint:
	@echo "Running linter..."
	npm run lint

# Format code
format:
	@echo "Formatting code..."
	npx prettier --write .
	@echo "✓ Code formatted"

# Initialize database
db-init:
	@echo "Initializing database..."
	@if [ ! -f "tasks.db" ]; then \
		echo "Database will be created on first run"; \
	else \
		echo "Database already exists"; \
	fi
	@echo "✓ Database ready"

# Reset database (WARNING: deletes all data)
db-reset:
	@echo "⚠️  WARNING: This will delete all your tracking data!"
	@read -p "Are you sure? (yes/no): " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		rm -f tasks.db; \
		echo "✓ Database reset complete"; \
	else \
		echo "Database reset cancelled"; \
	fi

# Quick setup for new users
setup: install db-init
	@echo ""
	@echo "✓ Setup complete!"
	@echo ""
	@echo "Run 'make dev' to start the development server"
	@echo ""

# Docker configuration
DOCKER_IMAGE_NAME = trackit
DOCKER_CONTAINER_NAME = trackit-app
DOCKER_PORT = 3000

# Build Docker image
docker-build:
	@echo "Building Docker image..."
	docker build -t $(DOCKER_IMAGE_NAME) .
	@echo "✓ Docker image built"

# Run Docker container
docker-run:
	@echo "Starting Docker container..."
	docker run -d \
		--name $(DOCKER_CONTAINER_NAME) \
		-p $(DOCKER_PORT):3000 \
		-v $$(pwd)/database:/app/database \
		$(DOCKER_IMAGE_NAME)
	@echo "✓ Container started at http://localhost:$(DOCKER_PORT)"

# Stop Docker container
docker-stop:
	@echo "Stopping Docker container..."
	-docker stop $(DOCKER_CONTAINER_NAME)
	-docker rm $(DOCKER_CONTAINER_NAME)
	@echo "✓ Container stopped"

# View Docker logs
docker-logs:
	docker logs -f $(DOCKER_CONTAINER_NAME)

# ---- Menu bar applet ----

# Run applet in development mode (requires Electron installed)
applet-dev:
	@echo "Starting TrackIt menu bar applet (dev)..."
	@cd menubar-app && npm install --silent && npx electron .

# Build applet as a .app bundle
applet-build:
	@echo "Building TrackIt.app..."
	@cd menubar-app && npm install --silent && npx electron-builder --mac dir
	@echo "✓ Built: menubar-app/dist/mac*/TrackIt.app"

# Build and install applet to ~/Applications
applet-install: applet-build
	@echo "Installing TrackIt.app to ~/Applications..."
	@rm -rf ~/Applications/TrackIt.app
	@cp -r menubar-app/dist/mac*/TrackIt.app ~/Applications/
	@xattr -d com.apple.quarantine ~/Applications/TrackIt.app 2>/dev/null || true
	@echo "✓ Installed — launch TrackIt from Spotlight or ~/Applications"

# Remove applet from ~/Applications
applet-uninstall:
	@echo "Removing TrackIt.app from ~/Applications..."
	@rm -rf ~/Applications/TrackIt.app
	@echo "✓ TrackIt.app removed"
