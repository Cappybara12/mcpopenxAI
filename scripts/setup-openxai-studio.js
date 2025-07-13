#!/usr/bin/env node

import { createInterface } from 'readline';
import fs from 'fs-extra';
import axios from 'axios';

class OpenXAIStudioSetup {
  constructor() {
    this.rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async question(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, resolve);
    });
  }

  async setup() {
    console.log('🌐 OpenXAI Studio Setup');
    console.log('Decentralized AI Model Deployment');
    console.log('===============================\n');
    
    console.log('🔗 OpenXAI Studio revolutionizes AI deployment with:');
    console.log('  ✅ Decentralized deployment (not controlled by single entity)');
    console.log('  ✅ X nodes for distributed computation');
    console.log('  ✅ Better cost rates and efficiency');
    console.log('  ✅ Web3 wallet integration');
    console.log('  ✅ Multiple model options\n');
    
    try {
      // Step 1: Wallet setup
      const walletConfig = await this.setupWallet();
      
      // Step 2: Model selection
      const modelConfig = await this.selectModel();
      
      // Step 3: Resource configuration
      const resourceConfig = await this.configureResources(modelConfig);
      
      // Step 4: Subscription options
      const subscriptionConfig = await this.configureSubscription();
      
      // Step 5: Save configuration
      await this.saveConfiguration(walletConfig, modelConfig, resourceConfig, subscriptionConfig);
      
      console.log('\n✅ OpenXAI Studio setup completed!');
      console.log('🚀 You can now deploy with `npm run deploy:openxai-studio`');
      console.log('🔗 Connect your wallet with `npm run connect:wallet`');
      
    } catch (error) {
      console.error('❌ Setup failed:', error.message);
    } finally {
      this.rl.close();
    }
  }

  async setupWallet() {
    console.log('💳 Web3 Wallet Configuration\n');
    
    console.log('Choose your Web3 wallet:');
    console.log('1. MetaMask');
    console.log('2. WalletConnect');
    console.log('3. Coinbase Wallet');
    console.log('4. Trust Wallet');
    console.log('5. Other');
    
    const choice = await this.question('Enter your choice (1-5): ');
    
    const wallets = {
      '1': 'metamask',
      '2': 'walletconnect',
      '3': 'coinbase',
      '4': 'trust',
      '5': 'other'
    };
    
    const walletType = wallets[choice] || 'metamask';
    
    console.log(`\n📱 Selected: ${walletType}`);
    console.log('ℹ️  Your wallet will be connected during deployment');
    console.log('ℹ️  This enables decentralized access to OpenXAI Studio');
    
    return {
      type: walletType,
      enabled: true
    };
  }

  async selectModel() {
    console.log('\n🤖 Model Selection\n');
    
    console.log('Available models in OpenXAI Studio:');
    console.log('1. DeepSeek R1 - Advanced reasoning model');
    console.log('2. Code Llama - Meta\'s code generation model');
    console.log('3. Gamma 2 - Google\'s latest model');
    console.log('4. Llama 3.2 Vision - 90B parameter vision model');
    console.log('5. Embedding Models - For text embeddings');
    console.log('6. Code Models - Specialized for code generation');
    
    const choice = await this.question('Enter your choice (1-6): ');
    
    const models = {
      '1': {
        name: 'deepseek-r1',
        displayName: 'DeepSeek R1',
        type: 'reasoning',
        parameters: ['1.5B', '7B', '32B'],
        description: 'Advanced reasoning model with strong analytical capabilities'
      },
      '2': {
        name: 'code-llama',
        displayName: 'Code Llama',
        type: 'code',
        parameters: ['1.5B', '7B', '13B', '34B'],
        description: 'Meta\'s specialized code generation model'
      },
      '3': {
        name: 'gamma-2',
        displayName: 'Gamma 2',
        type: 'general',
        parameters: ['1.5B', '7B', '13B'],
        description: 'Google\'s latest general-purpose model'
      },
      '4': {
        name: 'llama-3.2-vision',
        displayName: 'Llama 3.2 Vision',
        type: 'vision',
        parameters: ['11B', '90B'],
        description: 'Vision-enabled model for image and text processing'
      },
      '5': {
        name: 'embedding-model',
        displayName: 'Embedding Models',
        type: 'embedding',
        parameters: ['small', 'large'],
        description: 'Text embedding models for semantic search'
      },
      '6': {
        name: 'code-model',
        displayName: 'Code Models',
        type: 'code',
        parameters: ['1.5B', '7B'],
        description: 'Specialized code generation and analysis'
      }
    };
    
    const selectedModel = models[choice] || models['1'];
    
    console.log(`\n✅ Selected: ${selectedModel.displayName}`);
    console.log(`   Type: ${selectedModel.type}`);
    console.log(`   Description: ${selectedModel.description}`);
    
    // Select parameter size
    console.log('\nAvailable parameter sizes:');
    selectedModel.parameters.forEach((param, index) => {
      console.log(`${index + 1}. ${param}`);
    });
    
    const paramChoice = await this.question('Choose parameter size: ');
    const paramSize = selectedModel.parameters[parseInt(paramChoice) - 1] || selectedModel.parameters[0];
    
    console.log(`✅ Parameter size: ${paramSize}`);
    
    return {
      ...selectedModel,
      parameterSize: paramSize
    };
  }

  async configureResources(modelConfig) {
    console.log('\n⚙️  Resource Configuration\n');
    
    console.log('🖥️  X Node Deployment (Decentralized):');
    console.log('   - Computation distributed across multiple nodes');
    console.log('   - No single point of failure');
    console.log('   - Cost-effective compared to centralized providers\n');
    
    console.log('Resource options for', modelConfig.displayName);
    
    // RAM configuration
    console.log('RAM options:');
    console.log('1. 8GB - Basic deployment');
    console.log('2. 16GB - Recommended');
    console.log('3. 32GB - High performance');
    console.log('4. 64GB - Maximum performance');
    
    const ramChoice = await this.question('Choose RAM (1-4): ');
    const ramOptions = ['8GB', '16GB', '32GB', '64GB'];
    const selectedRAM = ramOptions[parseInt(ramChoice) - 1] || '16GB';
    
    // Storage configuration
    console.log('\nStorage options:');
    console.log('1. 50GB - Basic');
    console.log('2. 100GB - Recommended');
    console.log('3. 200GB - Extended');
    console.log('4. 500GB - Maximum');
    
    const storageChoice = await this.question('Choose storage (1-4): ');
    const storageOptions = ['50GB', '100GB', '200GB', '500GB'];
    const selectedStorage = storageOptions[parseInt(storageChoice) - 1] || '100GB';
    
    // CPU cores
    console.log('\nCPU cores:');
    console.log('1. 2 cores - Basic');
    console.log('2. 4 cores - Recommended');
    console.log('3. 8 cores - High performance');
    console.log('4. 16 cores - Maximum');
    
    const cpuChoice = await this.question('Choose CPU cores (1-4): ');
    const cpuOptions = ['2', '4', '8', '16'];
    const selectedCPU = cpuOptions[parseInt(cpuChoice) - 1] || '4';
    
    console.log('\n✅ Resource configuration:');
    console.log(`   RAM: ${selectedRAM}`);
    console.log(`   Storage: ${selectedStorage}`);
    console.log(`   CPU Cores: ${selectedCPU}`);
    
    return {
      ram: selectedRAM,
      storage: selectedStorage,
      cpu: selectedCPU,
      xnode: true
    };
  }

  async configureSubscription() {
    console.log('\n💳 Subscription Configuration\n');
    
    console.log('OpenXAI Studio subscription options:');
    console.log('1. Side Later - Pay later model');
    console.log('2. ERC 4337 - Subscription service');
    console.log('3. Model Ownership - Complete ownership and licensing');
    console.log('4. Fractionalized AI - Shared ownership model');
    
    const choice = await this.question('Choose subscription (1-4): ');
    
    const subscriptions = {
      '1': {
        type: 'side-later',
        name: 'Side Later',
        description: 'Pay-as-you-go model',
        features: ['No upfront cost', 'Pay per usage', 'Flexible scaling']
      },
      '2': {
        type: 'erc-4337',
        name: 'ERC 4337',
        description: 'Subscription service',
        features: ['Monthly subscription', 'Predictable costs', 'Premium support']
      },
      '3': {
        type: 'model-ownership',
        name: 'Model Ownership',
        description: 'Complete ownership and licensing',
        features: ['Full model control', 'Licensing rights', 'Commercial use']
      },
      '4': {
        type: 'fractionalized-ai',
        name: 'Fractionalized AI',
        description: 'Shared ownership model',
        features: ['Shared costs', 'Collaborative deployment', 'Community governance']
      }
    };
    
    const selectedSubscription = subscriptions[choice] || subscriptions['1'];
    
    console.log(`\n✅ Selected: ${selectedSubscription.name}`);
    console.log(`   Description: ${selectedSubscription.description}`);
    console.log('   Features:');
    selectedSubscription.features.forEach(feature => {
      console.log(`     - ${feature}`);
    });
    
    return selectedSubscription;
  }

  async saveConfiguration(walletConfig, modelConfig, resourceConfig, subscriptionConfig) {
    const config = {
      openxai_studio: {
        wallet: walletConfig,
        model: modelConfig,
        resources: resourceConfig,
        subscription: subscriptionConfig,
        deployment: {
          type: 'decentralized',
          platform: 'openxai-studio',
          xnode: true
        }
      },
      setup: {
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    };

    await fs.ensureDir('config');
    await fs.writeJSON('config/openxai-studio.json', config, { spaces: 2 });
    
    // Create environment file
    const envContent = `
# OpenXAI Studio Configuration
OPENXAI_STUDIO_ENABLED=true
OPENXAI_WALLET_TYPE=${walletConfig.type}
OPENXAI_MODEL=${modelConfig.name}
OPENXAI_PARAMETER_SIZE=${modelConfig.parameterSize}
OPENXAI_RAM=${resourceConfig.ram}
OPENXAI_STORAGE=${resourceConfig.storage}
OPENXAI_CPU=${resourceConfig.cpu}
OPENXAI_SUBSCRIPTION=${subscriptionConfig.type}
OPENXAI_XNODE=true
OPENXAI_DECENTRALIZED=true
`;

    await fs.writeFile('.env.openxai-studio', envContent.trim());
    
    console.log('\n💾 Configuration saved to config/openxai-studio.json');
    console.log('🔒 Environment variables saved to .env.openxai-studio');
  }
}

// Run the setup
const setup = new OpenXAIStudioSetup();
setup.setup().catch(console.error); 