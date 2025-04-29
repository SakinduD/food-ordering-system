# PowerShell script to build Docker images for all microservices and the client

$services = @(
    "client",
    "server/api-gateway",
    "server/auth-service",
    "server/restaurant-service",
    "server/menu-service",
    "server/order-service",
    "server/delivery-service",
    "server/payment-service",
    "server/notification-service"
)

foreach ($service in $services) {
    Write-Host "Building Docker image for $service..." -ForegroundColor Cyan
    docker build -t food-ordering-system-$(Split-Path $service -Leaf) $service
}

Write-Host "All images built successfully!" -ForegroundColor Green
