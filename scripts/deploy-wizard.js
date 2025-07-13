#!/usr/bin/env node

import { createInterface } from 'readline';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs-extra';
import path from 'path';

const execAsync = promisify(exec);

class DeploymentWizard {
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

  async run() {
    console.log('🚀 OpenXAI Deployment Wizard');
    console.log('=====================================\n');

    try {
      // Step 1: Choose deployment provider
      const provider = await this.chooseProvider();
      
      // Step 2: Configure model settings
      const modelConfig = await this.configureModel();
      
      // Step 3: Set up authentication if needed
      const authConfig = await this.setupAuth(provider);
      
      // Step 4: Configure scaling and resources
      const scalingConfig = await this.configureScaling(provider);
      
      // Step 5: Review and deploy
      await this.reviewAndDeploy(provider, modelConfig, authConfig, scalingConfig);
      
    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      process.exit(1);
    } finally {
      this.rl.close();
    }
  }

  async chooseProvider() {
    console.log('📡 Choose your deployment provider:\n');
    console.log('1. Xnode (Free tier) - Recommended for beginners');
    console.log('2. Xnode DVM (500 OPNX tokens) - Advanced features');
    console.log('3. Vultr ($655/month) - Washington DC');
    console.log('4. AWS EC2 ($1,321/month) - Hong Kong');
    console.log('5. Google Cloud ($1,745/month) - NYC');
    console.log('6. Custom configuration\n');

    const choice = await this.question('Enter your choice (1-6): ');
    
    const providers = {
      '1': 'xnode-free',
      '2': 'xnode-dvm',
      '3': 'vultr',
      '4': 'aws',
      '5': 'gcp',
      '6': 'custom'
    };

    const provider = providers[choice];
    if (!provider) {
      console.log('❌ Invalid choice. Please try again.');
      return this.chooseProvider();
    }

    console.log(`✅ Selected: ${provider}\n`);
    return provider;
  }

  async configureModel() {
    console.log('🤖 Configure your OpenXAI model:\n');
    
    const modelName = await this.question('Model name (default: openxai-explainer): ') || 'openxai-explainer';
    const framework = await this.question('Framework version (default: 1.0.0): ') || '1.0.0';
    
    console.log('Available explainers: lime, shap, integrated_gradients, gradcam');
    const explainer = await this.question('Choose explainer (default: shap): ') || 'shap';
    
    console.log('Available datasets: german, compas, adult, synthetic');
    const dataset = await this.question('Choose dataset (default: german): ') || 'german';

    const config = {
      name: modelName,
      version: framework,
      explainer,
      dataset
    };

    console.log('✅ Model configuration saved\n');
    return config;
  }

  async setupAuth(provider) {
    console.log('🔐 Authentication setup:\n');
    
    if (provider === 'xnode-free') {
      console.log('✅ No authentication required for Xnode free tier');
      return { type: 'none' };
    }

    console.log('Choose authentication method:');
    console.log('1. API Key');
    console.log('2. Web3 Wallet');
    console.log('3. OAuth (Google/GitHub)');
    
    const authChoice = await this.question('Enter your choice (1-3): ');
    
    let authConfig = {};
    
    switch (authChoice) {
      case '1':
        const apiKey = await this.question('Enter your API key: ');
        authConfig = { type: 'api_key', key: apiKey };
        break;
      case '2':
        console.log('Web3 wallet will be configured during deployment');
        authConfig = { type: 'web3' };
        break;
      case '3':
        const oauthProvider = await this.question('OAuth provider (google/github): ');
        authConfig = { type: 'oauth', provider: oauthProvider };
        break;
      default:
        console.log('❌ Invalid choice, defaulting to API key');
        authConfig = { type: 'api_key' };
    }

    console.log('✅ Authentication configured\n');
    return authConfig;
  }

  async configureScaling(provider) {
    console.log('⚡ Scaling configuration:\n');
    
    if (provider === 'xnode-free') {
      console.log('✅ Auto-scaling enabled for free tier');
      return { type: 'auto', instances: 1 };
    }

    console.log('Scaling options:');
    console.log('1. Auto-scaling (recommended)');
    console.log('2. Fixed instances');
    console.log('3. Manual scaling');
    
    const scalingChoice = await this.question('Enter your choice (1-3): ') || '1';
    
    let scalingConfig = {};
    
    switch (scalingChoice) {
      case '1':
        const maxInstances = await this.question('Maximum instances (default: 5): ') || '5';
        scalingConfig = { type: 'auto', max_instances: parseInt(maxInstances) };
        break;
      case '2':
        const instances = await this.question('Number of instances (default: 1): ') || '1';
        scalingConfig = { type: 'fixed', instances: parseInt(instances) };
        break;
      case '3':
        scalingConfig = { type: 'manual' };
        break;
      default:
        scalingConfig = { type: 'auto', max_instances: 5 };
    }

    console.log('✅ Scaling configured\n');
    return scalingConfig;
  }

  async reviewAndDeploy(provider, modelConfig, authConfig, scalingConfig) {
    console.log('📋 Deployment Summary:\n');
    console.log('Provider:', provider);
    console.log('Model:', modelConfig.name);
    console.log('Explainer:', modelConfig.explainer);
    console.log('Dataset:', modelConfig.dataset);
    console.log('Auth:', authConfig.type);
    console.log('Scaling:', scalingConfig.type);
    console.log('');

    const confirm = await this.question('Deploy now? (y/n): ');
    
    if (confirm.toLowerCase() !== 'y') {
      console.log('❌ Deployment cancelled');
      return;
    }

    console.log('🚀 Starting deployment...\n');
    
    // Save configuration
    const config = {
      provider,
      model: modelConfig,
      auth: authConfig,
      scaling: scalingConfig,
      timestamp: new Date().toISOString()
    };

    await fs.ensureDir('config');
    await fs.writeJSON('config/deployment.json', config, { spaces: 2 });

    // Execute deployment based on provider
    try {
      switch (provider) {
        case 'xnode-free':
        case 'xnode-dvm':
          await execAsync('npm run deploy:xnode');
          break;
        case 'vultr':
          await execAsync('npm run deploy:vultr');
          break;
        case 'aws':
          await execAsync('npm run deploy:aws');
          break;
        case 'gcp':
          await execAsync('npm run deploy:gcp');
          break;
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }

      console.log('✅ Deployment completed successfully!');
      console.log('🌐 Your endpoint will be available shortly');
      console.log('📊 Run `npm run status` to check deployment status');
      
    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      throw error;
    }
  }
}

// Run the wizard
const wizard = new DeploymentWizard();
wizard.run().catch(console.error); 