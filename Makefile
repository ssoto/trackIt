.PHONY: help install dev build start clean test lint format db-init db-reset

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
