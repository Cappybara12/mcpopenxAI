#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

class XnodeDeployer {
  constructor() {
    this.apiUrl = 'https://api.xnode.ai';
    this.config = {};
  }

  async loadConfig() {
    try {
      this.config = await fs.readJSON('config/deployment.json');
    } catch (error) {
      console.log('⚠️  No deployment config found, using defaults');
      this.config = {
        model: {
          name: 'openxai-explainer',
          version: '1.0.0',
          explainer: 'shap',
          dataset: 'german'
        },
        provider: 'xnode-free'
      };
    }
  }

  async deploy() {
    console.log('🚀 Deploying to Xnode...\n');
    
    await this.loadConfig();
    
    try {
      // Step 1: Create deployment package
      console.log('📦 Creating deployment package...');
      const packageInfo = await this.createPackage();
      
      // Step 2: Upload to Xnode
      console.log('⬆️  Uploading to Xnode...');
      const uploadResult = await this.uploadToXnode(packageInfo);
      
      // Step 3: Configure deployment
      console.log('⚙️  Configuring deployment...');
      const deploymentConfig = await this.configureDeployment(uploadResult);
      
      // Step 4: Start deployment
      console.log('🚀 Starting deployment...');
      const deployment = await this.startDeployment(deploymentConfig);
      
      // Step 5: Wait for deployment to be ready
      console.log('⏳ Waiting for deployment to be ready...');
      const endpoint = await this.waitForDeployment(deployment.id);
      
      console.log('\n✅ Deployment completed successfully!');
      console.log(`🌐 Your OpenXAI model is available at: ${endpoint}`);
      console.log(`📊 Model: ${this.config.model.name}`);
      console.log(`🧠 Explainer: ${this.config.model.explainer}`);
      console.log(`📁 Dataset: ${this.config.model.dataset}`);
      
      // Save deployment info
      await this.saveDeploymentInfo(deployment, endpoint);
      
    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      throw error;
    }
  }

  async createPackage() {
    const packageInfo = {
      name: this.config.model.name,
      version: this.config.model.version,
      framework: 'openxai',
      explainer: this.config.model.explainer,
      dataset: this.config.model.dataset,
      files: await this.getProjectFiles()
    };

    await fs.ensureDir('dist');
    await fs.writeJSON('dist/package.json', packageInfo, { spaces: 2 });
    
    return packageInfo;
  }

  async getProjectFiles() {
    const files = [];
    
    // Add main files
    const mainFiles = ['index.js', 'package.json', 'README.md'];
    for (const file of mainFiles) {
      if (await fs.pathExists(file)) {
        files.push({
          path: file,
          content: await fs.readFile(file, 'utf8')
        });
      }
    }
    
    return files;
  }

  async uploadToXnode(packageInfo) {
    const response = await axios.post(`${this.apiUrl}/v1/upload`, {
      package: packageInfo,
      type: 'openxai-mcp',
      tier: 'free'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Version': '1.0'
      }
    });

    return response.data;
  }

  async configureDeployment(uploadResult) {
    const config = {
      upload_id: uploadResult.id,
      name: this.config.model.name,
      framework: 'openxai',
      runtime: 'node18',
      resources: {
        cpu: '1',
        memory: '1Gi',
        storage: '5Gi'
      },
      environment: {
        NODE_ENV: 'production',
        OPENXAI_MODEL: this.config.model.explainer,
        OPENXAI_DATASET: this.config.model.dataset
      },
      endpoints: [
        {
          path: '/v1/chat/completions',
          method: 'POST',
          description: 'OpenAI-compatible chat completions'
        },
        {
          path: '/v1/explanations',
          method: 'POST',
          description: 'Generate explanations'
        },
        {
          path: '/v1/evaluate',
          method: 'POST',
          description: 'Evaluate explanations'
        }
      ]
    };

    return config;
  }

  async startDeployment(config) {
    const response = await axios.post(`${this.apiUrl}/v1/deploy`, config, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Version': '1.0'
      }
    });

    return response.data;
  }

  async waitForDeployment(deploymentId) {
    const maxAttempts = 60; // 5 minutes
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        const response = await axios.get(`${this.apiUrl}/v1/deployments/${deploymentId}`);
        const status = response.data.status;
        
        if (status === 'ready') {
          return response.data.endpoint;
        } else if (status === 'failed') {
          throw new Error(`Deployment failed: ${response.data.error}`);
        }
        
        // Show progress
        const progress = response.data.progress || 0;
        process.stdout.write(`\r⏳ Deployment progress: ${progress}%`);
        
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
        attempts++;
        
      } catch (error) {
        if (attempts >= maxAttempts - 1) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 5000));
        attempts++;
      }
    }
    
    throw new Error('Deployment timeout');
  }

  async saveDeploymentInfo(deployment, endpoint) {
    const info = {
      id: deployment.id,
      name: this.config.model.name,
      provider: 'xnode',
      endpoint: endpoint,
      status: 'ready',
      deployed_at: new Date().toISOString(),
      config: this.config
    };

    await fs.ensureDir('deployments');
    await fs.writeJSON(`deployments/${deployment.id}.json`, info, { spaces: 2 });
    
    // Update main deployments list
    let deployments = [];
    try {
      deployments = await fs.readJSON('deployments/list.json');
    } catch (error) {
      // File doesn't exist, start with empty array
    }
    
    deployments.push(info);
    await fs.writeJSON('deployments/list.json', deployments, { spaces: 2 });
  }
}

// Run the deployment
const deployer = new XnodeDeployer();
deployer.deploy().catch(console.error); 