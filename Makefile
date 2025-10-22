# Makefile for QR Attendance System
# Provides convenient commands for Docker operations

.PHONY: help build up down restart logs shell clean backup restore

help: ## Show this help message
	@echo "QR Attendance System - Docker Commands"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

build: ## Build Docker image
	docker-compose build

up: ## Start the application
	docker-compose up -d
	@echo "✅ Application started at http://localhost:8000"

down: ## Stop the application
	docker-compose down

restart: ## Restart the application
	docker-compose restart

logs: ## View application logs
	docker-compose logs -f

shell: ## Access container shell
	docker-compose exec qr-attends sh

ps: ## Show container status
	docker-compose ps

clean: ## Remove containers and volumes (WARNING: deletes data!)
	docker-compose down -v
	@echo "⚠️  All data has been removed"

backup: ## Backup Deno KV database
	@mkdir -p backups
	@TIMESTAMP=$$(date +%Y%m%d_%H%M%S); \
	docker-compose exec -T qr-attends tar czf - /data/kv.db > "backups/kv_backup_$$TIMESTAMP.tar.gz" && \
	echo "✅ Backup created: backups/kv_backup_$$TIMESTAMP.tar.gz"

restore: ## Restore from latest backup (Usage: make restore BACKUP=backups/kv_backup_YYYYMMDD_HHMMSS.tar.gz)
	@if [ -z "$(BACKUP)" ]; then \
		echo "❌ Error: Please specify BACKUP file"; \
		echo "Usage: make restore BACKUP=backups/kv_backup_YYYYMMDD_HHMMSS.tar.gz"; \
		exit 1; \
	fi
	@cat $(BACKUP) | docker-compose exec -T qr-attends tar xzf - -C /
	@docker-compose restart
	@echo "✅ Database restored from $(BACKUP)"

dev: ## Start in development mode with live reload
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

prod: ## Deploy to production
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

test: ## Run tests (placeholder)
	@echo "Running tests..."
	docker-compose exec qr-attends deno test --allow-all

check: ## Run linting and formatting checks
	docker-compose exec qr-attends deno task check

update: ## Update dependencies
	docker-compose exec qr-attends deno task update
