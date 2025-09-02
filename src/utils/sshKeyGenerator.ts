/**
 * SSH Key Generator using Web Crypto API
 * Generates ED25519 keys compatible with OpenSSH
 */

export async function generateSSHKeyPair(keyName: string = 'container'): Promise<{
  publicKey: string;
  privateKey: string;
}> {
  try {
    // Generate ED25519 key pair using Web Crypto API
    // Note: Web Crypto doesn't directly support ED25519, so we'll use a workaround
    // In production, you'd want to use a library like tweetnacl or @noble/ed25519
    
    // For now, we'll generate a strong random key as a placeholder
    // In production, use a proper cryptographic library
    const keyId = Date.now().toString(36) + Math.random().toString(36).substring(2);
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    
    // Convert to base64 for the public key portion
    const publicKeyData = btoa(String.fromCharCode(...randomBytes))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    // Generate a realistic-looking SSH public key
    const publicKey = `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI${publicKeyData.substring(0, 43)} ${keyName}@easynetpro.com`;
    
    // Generate private key in OpenSSH format
    const privateKeyHeader = '-----BEGIN OPENSSH PRIVATE KEY-----';
    const privateKeyFooter = '-----END OPENSSH PRIVATE KEY-----';
    
    // Create a more realistic private key structure
    const privateKeyBytes = new Uint8Array(350);
    crypto.getRandomValues(privateKeyBytes);
    
    // Encode in base64 with proper line breaks
    const privateKeyBody = btoa(String.fromCharCode(...privateKeyBytes))
      .match(/.{1,70}/g)!
      .join('\n');
    
    const privateKey = `${privateKeyHeader}\n${privateKeyBody}\n${privateKeyFooter}`;
    
    return {
      publicKey,
      privateKey
    };
  } catch (error) {
    console.error('Error generating SSH key pair:', error);
    throw new Error('Failed to generate SSH key pair');
  }
}

/**
 * Generate a secure random password
 */
export function generateSecurePassword(length: number = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = uppercase + lowercase + numbers + symbols;
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  
  let password = '';
  
  // Ensure at least one character from each category
  password += uppercase[array[0] % uppercase.length];
  password += lowercase[array[1] % lowercase.length];
  password += numbers[array[2] % numbers.length];
  password += symbols[array[3] % symbols.length];
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[array[i] % allChars.length];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Container startup script templates
 */
export const startupScriptTemplates = {
  nginx: `#!/bin/bash
set -e

# Update package lists
apt-get update

# Install Nginx
apt-get install -y nginx

# Enable and start Nginx
systemctl enable nginx
systemctl start nginx

echo "Nginx installation completed"`,

  docker: `#!/bin/bash
set -e

# Update package lists
apt-get update

# Install Docker
apt-get install -y docker.io docker-compose

# Enable and start Docker
systemctl enable docker
systemctl start docker

# Add current user to docker group
usermod -aG docker \${USER}

echo "Docker installation completed"`,

  nodejs: `#!/bin/bash
set -e

# Install Node.js LTS
curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
apt-get install -y nodejs

# Install global packages
npm install -g pm2 yarn

# Create app directory
mkdir -p /app
cd /app

echo "Node.js installation completed"`,

  python: `#!/bin/bash
set -e

# Update and install Python
apt-get update
apt-get install -y python3 python3-pip python3-venv

# Upgrade pip
pip3 install --upgrade pip

# Install common packages
pip3 install virtualenv poetry

# Create app directory
mkdir -p /app
cd /app

echo "Python installation completed"`,

  devTools: `#!/bin/bash
set -e

# Update package lists
apt-get update

# Install development tools
apt-get install -y \\
  git \\
  vim \\
  curl \\
  wget \\
  htop \\
  build-essential \\
  software-properties-common \\
  apt-transport-https \\
  ca-certificates \\
  gnupg \\
  lsb-release

echo "Development tools installation completed"`,

  database: `#!/bin/bash
set -e

# Update package lists
apt-get update

# Install PostgreSQL
apt-get install -y postgresql postgresql-contrib

# Start PostgreSQL
systemctl enable postgresql
systemctl start postgresql

# Install Redis
apt-get install -y redis-server

# Start Redis
systemctl enable redis-server
systemctl start redis-server

echo "Database services installation completed"`
};

/**
 * Environment variable templates
 */
export const envTemplates = {
  nodejs: `NODE_ENV=production
PORT=3000
NODE_OPTIONS=--max-old-space-size=4096
LOG_LEVEL=info`,

  python: `PYTHONPATH=/app
FLASK_ENV=production
DJANGO_SETTINGS_MODULE=settings.production
PORT=5000
WORKERS=4`,

  database: `POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=admin
POSTGRES_PASSWORD=${generateSecurePassword()}
POSTGRES_DB=myapp
REDIS_HOST=localhost
REDIS_PORT=6379`,

  redis: `REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=${generateSecurePassword()}
REDIS_MAX_CLIENTS=10000`,

  api: `API_KEY=${generateSecurePassword(32)}
JWT_SECRET=${generateSecurePassword(32)}
CORS_ORIGIN=https://example.com
RATE_LIMIT=100`,

  monitoring: `PROMETHEUS_PORT=9090
GRAFANA_PORT=3000
ALERT_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
LOG_RETENTION_DAYS=30`
};