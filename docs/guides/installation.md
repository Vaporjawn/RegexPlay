# Installation Guide

This guide covers all installation methods for RegexPlay across different platforms and environments.

## 📋 System Requirements

- **Node.js**: Version 14.0.0 or higher
- **npm**: Version 6.0.0 or higher (comes with Node.js)
- **Operating Systems**:
  - ✅ macOS 10.14+
  - ✅ Linux (Ubuntu 18.04+, CentOS 7+, etc.)
  - ✅ Windows 10+
  - ✅ Windows Subsystem for Linux (WSL)

## 🚀 Quick Installation

### Global Installation (Recommended)

Install RegexPlay globally to use it from anywhere:

```bash
npm install -g regexplay
```

After installation, verify it works:

```bash
regexplay --help
```

### One-Time Usage

Run RegexPlay without installing:

```bash
npx regexplay
```

## 📦 Installation Methods

### Method 1: NPM Global Installation

This is the recommended approach for most users.

```bash
# Install globally
npm install -g regexplay

# Verify installation
regexplay --version

# Start using RegexPlay
regexplay
```

**Pros:**
- Available from any directory
- Easy to update
- No need to remember installation path

**Cons:**
- Requires global npm permissions
- May require `sudo` on some systems

### Method 2: Local Project Installation

Install RegexPlay as a development dependency in your project:

```bash
# Navigate to your project directory
cd your-project

# Install as dev dependency
npm install --save-dev regexplay

# Use with npx
npx regexplay

# Or add to package.json scripts
```

Add to your `package.json`:

```json
{
  "scripts": {
    "regex": "regexplay"
  }
}
```

Then run:

```bash
npm run regex
```

### Method 3: Development Installation

For contributing to RegexPlay:

```bash
# Clone the repository
git clone https://github.com/Vaporjawn/RegexPlay.git

# Navigate to directory
cd RegexPlay

# Install dependencies
npm install

# Run locally
node cli.js

# Or make it globally available
npm link
```

## 🔧 Platform-Specific Instructions

### macOS

#### Using Homebrew (Alternative)

If you prefer Homebrew, first install Node.js:

```bash
# Install Node.js via Homebrew
brew install node

# Install RegexPlay
npm install -g regexplay
```

#### Using NVM (Node Version Manager)

```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal or source profile
source ~/.zshrc

# Install and use Node.js
nvm install node
nvm use node

# Install RegexPlay
npm install -g regexplay
```

### Linux

#### Ubuntu/Debian

```bash
# Update package index
sudo apt update

# Install Node.js and npm
sudo apt install nodejs npm

# Verify versions
node --version
npm --version

# Install RegexPlay
npm install -g regexplay
```

#### CentOS/RHEL/Fedora

```bash
# Install Node.js and npm
sudo dnf install nodejs npm

# Or for older systems
sudo yum install nodejs npm

# Install RegexPlay
npm install -g regexplay
```

#### Arch Linux

```bash
# Install Node.js
sudo pacman -S nodejs npm

# Install RegexPlay
npm install -g regexplay
```

### Windows

#### Using Node.js Installer

1. Download Node.js from [nodejs.org](https://nodejs.org/)
2. Run the installer (.msi file)
3. Open Command Prompt or PowerShell
4. Install RegexPlay:

```cmd
npm install -g regexplay
```

#### Using Chocolatey

```powershell
# Install Node.js via Chocolatey
choco install nodejs

# Install RegexPlay
npm install -g regexplay
```

#### Using Windows Subsystem for Linux (WSL)

```bash
# From WSL terminal, follow Linux instructions
sudo apt update
sudo apt install nodejs npm
npm install -g regexplay
```

## 🔐 Permission Issues

### macOS/Linux Permission Errors

If you get permission errors:

```bash
# Option 1: Use sudo (not recommended)
sudo npm install -g regexplay

# Option 2: Configure npm to use a different directory (recommended)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.profile
source ~/.profile

# Now install without sudo
npm install -g regexplay
```

### Windows Permission Errors

Run Command Prompt or PowerShell as Administrator:

```cmd
npm install -g regexplay
```

## 🔄 Updating RegexPlay

### Update Global Installation

```bash
npm update -g regexplay
```

### Check Current Version

```bash
regexplay --version
```

### View Available Versions

```bash
npm view regexplay versions --json
```

## 🗑️ Uninstalling RegexPlay

### Remove Global Installation

```bash
npm uninstall -g regexplay
```

### Remove Local Installation

```bash
npm uninstall regexplay
```

## ✅ Verify Installation

After installation, verify everything works:

```bash
# Check version
regexplay --version

# Test basic functionality
regexplay --regex "\d+" --text "Test 123"

# Start interactive mode
regexplay
```

## 🚨 Troubleshooting

### Common Issues

#### "Command not found" Error

**Problem**: `regexplay: command not found`

**Solutions**:
1. Ensure global installation completed successfully
2. Check if npm global bin directory is in PATH
3. Try restarting terminal

```bash
# Check npm global bin directory
npm config get prefix

# Check if it's in PATH
echo $PATH
```

#### Permission Denied Errors

**Problem**: `EACCES: permission denied`

**Solutions**:
1. Configure npm to use different directory (see Permission Issues above)
2. Use `npx regexplay` instead of global installation
3. Use local installation in project

#### Node.js Version Issues

**Problem**: RegexPlay requires Node.js 14+

**Solution**: Update Node.js
```bash
# Check current version
node --version

# Update using package manager or NVM
nvm install node
nvm use node
```

#### Network/Proxy Issues

**Problem**: npm install fails due to network

**Solutions**:
```bash
# Configure npm proxy
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080

# Or use different registry
npm config set registry https://registry.npmjs.org/
```

### Getting Help

If you encounter issues not covered here:

1. Check [FAQ](faq.md)
2. Search [GitHub Issues](https://github.com/Vaporjawn/RegexPlay/issues)
3. Create a new issue with:
   - Operating system and version
   - Node.js and npm versions
   - Complete error message
   - Steps to reproduce

## 📚 Next Steps

After successful installation:

1. Read the [Quick Start Guide](quick-start.md)
2. Try the [Beginner Tutorial](beginner-tutorial.md)
3. Explore [Common Patterns](../examples/common-patterns.md)

---

*Having trouble? Check our [FAQ](faq.md) or [open an issue](https://github.com/Vaporjawn/RegexPlay/issues).*