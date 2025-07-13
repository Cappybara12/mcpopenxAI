#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs-extra';

class DeploymentStatus {
  constructor() {
    this.deployments = [];
  }

  async loadDeployments() {
    try {
      this.deployments = await fs.readJSON('deployments/list.json');
    } catch (error) {
      console.log('📭 No deployments found');
      return [];
    }
  }

  async checkStatus() {
    console.log('📊 Checking deployment status...\n');
    
    await this.loadDeployments();
    
    if (this.deployments.length === 0) {
      console.log('No deployments found. Run `npm run deploy` to create one.');
      return;
    }

    for (const deployment of this.deployments) {
      await this.checkDeploymentStatus(deployment);
    }
  }

  async checkDeploymentStatus(deployment) {
    try {
      console.log(`🔍 Checking: ${deployment.name}`);
      console.log(`   Provider: ${deployment.provider}`);
      console.log(`   Deployed: ${new Date(deployment.deployed_at).toLocaleString()}`);
      
      // Check if endpoint is accessible
      const healthCheck = await this.performHealthCheck(deployment.endpoint);
      
      if (healthCheck.status === 'healthy') {
        console.log(`   Status: ✅ HEALTHY`);
        console.log(`   Endpoint: ${deployment.endpoint}`);
        console.log(`   Response time: ${healthCheck.responseTime}ms`);
        
        // Check model-specific health
        const modelHealth = await this.checkModelHealth(deployment);
        if (modelHealth) {
          console.log(`   Model: ✅ ${deployment.config.model.explainer} on ${deployment.config.model.dataset}`);
        }
      } else {
        console.log(`   Status: ❌ UNHEALTHY`);
        console.log(`   Error: ${healthCheck.error}`);
      }
      
      console.log('');
      
    } catch (error) {
      console.log(`   Status: ❌ ERROR - ${error.message}\n`);
    }
  }

  async performHealthCheck(endpoint) {
    const startTime = Date.now();
    
    try {
      const response = await axios.get(`${endpoint}/health`, {
        timeout: 5000,
        headers: {
          'User-Agent': 'OpenXAI-MCP-StatusChecker/1.0'
        }
      });
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        responseTime,
        data: response.data
      };
      
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        responseTime: Date.now() - startTime
      };
    }
  }

  async checkModelHealth(deployment) {
    try {
      const response = await axios.post(`${deployment.endpoint}/v1/explanations`, {
        method: deployment.config.model.explainer,
        data: [1, 0, 1, 0, 1], // Sample data
        model: deployment.config.model.dataset
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return response.status === 200;
      
    } catch (error) {
      console.log(`   Model Health: ⚠️  ${error.message}`);
      return false;
    }
  }

  async showDetailedStatus() {
    console.log('📈 Detailed deployment status...\n');
    
    await this.loadDeployments();
    
    for (const deployment of this.deployments) {
      console.log(`═══════════════════════════════════════`);
      console.log(`📊 ${deployment.name.toUpperCase()}`);
      console.log(`═══════════════════════════════════════`);
      console.log(`ID: ${deployment.id}`);
      console.log(`Provider: ${deployment.provider}`);
      console.log(`Endpoint: ${deployment.endpoint}`);
      console.log(`Status: ${deployment.status}`);
      console.log(`Deployed: ${new Date(deployment.deployed_at).toLocaleString()}`);
      console.log('');
      console.log('🤖 Model Configuration:');
      console.log(`   Name: ${deployment.config.model.name}`);
      console.log(`   Version: ${deployment.config.model.version}`);
      console.log(`   Explainer: ${deployment.config.model.explainer}`);
      console.log(`   Dataset: ${deployment.config.model.dataset}`);
      console.log('');
      console.log('🔐 Authentication:');
      console.log(`   Type: ${deployment.config.auth?.type || 'none'}`);
      console.log('');
      console.log('⚡ Scaling:');
      console.log(`   Type: ${deployment.config.scaling?.type || 'auto'}`);
      console.log(`   Instances: ${deployment.config.scaling?.instances || 'auto'}`);
      console.log('');
      
      // Live metrics
      await this.showLiveMetrics(deployment);
      console.log('');
    }
  }

  async showLiveMetrics(deployment) {
    try {
      const response = await axios.get(`${deployment.endpoint}/metrics`, {
        timeout: 5000
      });
      
      const metrics = response.data;
      console.log('📊 Live Metrics:');
      console.log(`   Requests: ${metrics.requests || 'N/A'}`);
      console.log(`   Errors: ${metrics.errors || 'N/A'}`);
      console.log(`   Avg Response Time: ${metrics.avgResponseTime || 'N/A'}ms`);
      console.log(`   CPU Usage: ${metrics.cpuUsage || 'N/A'}%`);
      console.log(`   Memory Usage: ${metrics.memoryUsage || 'N/A'}%`);
      
    } catch (error) {
      console.log('📊 Live Metrics: ⚠️  Not available');
    }
  }
}

// Check command line arguments
const args = process.argv.slice(2);
const detailed = args.includes('--detailed') || args.includes('-d');

const statusChecker = new DeploymentStatus();

if (detailed) {
  statusChecker.showDetailedStatus().catch(console.error);
} else {
  statusChecker.checkStatus().catch(console.error);
} 