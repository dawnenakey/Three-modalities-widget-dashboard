#!/bin/bash

# Docker Installation Script for Ubuntu EC2
# This script installs Docker and Docker Compose on Ubuntu

set -e

echo "======================================"
echo "Docker Installation Script"
echo "======================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running on Ubuntu
if ! command -v lsb_release &> /dev/null; then
    print_error "This script is designed for Ubuntu. Please install manually."
    exit 1
fi

print_info "Updating package index..."
sudo apt-get update

print_info "Installing prerequisites..."
sudo apt-get install -y ca-certificates curl gnupg lsb-release

print_info "Adding Docker's official GPG key..."
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

print_info "Setting up Docker repository..."
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

print_info "Updating package index with Docker packages..."
sudo apt-get update

print_info "Installing Docker Engine, CLI, and Docker Compose..."
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

print_info "Starting Docker service..."
sudo systemctl start docker
sudo systemctl enable docker

print_info "Adding current user to docker group..."
sudo usermod -aG docker $USER

print_info "Verifying Docker installation..."
sudo docker --version
sudo docker compose version

echo ""
echo "======================================"
print_info "Docker installation complete!"
echo "======================================"
echo ""
print_warning "IMPORTANT: You must LOG OUT and LOG BACK IN for docker group permissions to take effect."
echo ""
echo "After logging back in, verify with:"
echo "  docker --version"
echo "  docker ps"
echo ""
print_info "Once verified, you can deploy the application with:"
echo "  ./deploy.sh"
echo "======================================"
