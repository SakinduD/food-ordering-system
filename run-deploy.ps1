# Stop all running containers
Write-Host "Stopping all running containers..." -ForegroundColor Yellow
docker-compose down

# Rebuild all Docker images
Write-Host "Rebuilding all Docker images..." -ForegroundColor Cyan
./build-images.ps1

# Start services with host network mode
Write-Host "Starting services with host network mode..." -ForegroundColor Green
docker-compose up -d

# Show service status
Write-Host "Service Status:" -ForegroundColor Magenta
docker-compose ps

# Show access URLs
Write-Host "Deployment complete! The services should now be accessible at:" -ForegroundColor Green
Write-Host "- Client: http://localhost:3000" -ForegroundColor Cyan
Write-Host "- API Gateway: http://localhost:5007" -ForegroundColor Cyan
Write-Host "- Auth Service: http://localhost:5010" -ForegroundColor Cyan
Write-Host "- Restaurant Service: http://localhost:5000" -ForegroundColor Cyan
Write-Host "- Menu Service: http://localhost:5025" -ForegroundColor Cyan
Write-Host "- Order Service: http://localhost:5001" -ForegroundColor Cyan
Write-Host "- Notification Service: http://localhost:5020" -ForegroundColor Cyan
Write-Host "- Delivery Service: http://localhost:5005" -ForegroundColor Cyan
Write-Host "- Payment Service: http://localhost:5008" -ForegroundColor Cyan