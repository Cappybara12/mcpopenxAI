# OpenXAI MCP Server

A Model Context Protocol (MCP) server for [OpenXAI](https://open-xai.github.io/), providing comprehensive tools for evaluating and benchmarking post hoc explanation methods in AI models.

## Overview

OpenXAI is a general-purpose lightweight library that provides a comprehensive list of functions to systematically evaluate the reliability of post hoc explanation methods. This MCP server exposes OpenXAI's functionality through a standard interface that can be used with AI assistants and other MCP-compatible applications.

## Features

🔍 **Explanation Methods**
- LIME (Local Interpretable Model-agnostic Explanations)
- SHAP (SHapley Additive exPlanations)
- Integrated Gradients
- Grad-CAM
- Guided Backpropagation

📊 **Evaluation Metrics**
- **Faithfulness**: PGI, PGU
- **Stability**: RIS, RRS, ROS
- **Ground Truth**: FA, RA, SA, SRA, RC, PRA
- **Fairness**: Subgroup analysis

🗂️ **Datasets**
- Synthetic datasets with ground truth explanations
- Real-world datasets (German Credit, COMPAS, Adult Income)
- Support for tabular, image, and text data

🤖 **Pre-trained Models**
- Neural Networks (ANN)
- Logistic Regression
- Random Forest
- Support Vector Machine
- XGBoost

🏆 **Leaderboards**
- Access to public XAI benchmarking results
- Transparent evaluation and comparison

## Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Python 3.7+ (for OpenXAI functionality)

### Install the MCP Server

```bash
# Clone the repository
git clone https://github.com/yourusername/openxai-mcp.git
cd openxai-mcp

# Install dependencies
npm install

# Install OpenXAI Python package
pip install openxai
```

### Configure with Cursor

Add the following to your Cursor settings (`~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "openxai": {
      "command": "node",
      "args": ["/path/to/openxai-mcp/index.js"],
      "env": {}
    }
  }
}
```

## Available Tools

### 1. Dataset Management

#### `list_datasets`
List available datasets in the OpenXAI framework.

**Parameters:**
- `category` (optional): Filter by dataset category (`synthetic`, `real-world`, `tabular`, `image`, `text`, `all`)

**Example:**
```
List tabular datasets available in OpenXAI
```

#### `load_dataset`
Load a specific dataset from OpenXAI.

**Parameters:**
- `dataset_name`: Name of the dataset (e.g., `german`, `compas`, `adult`)
- `download` (optional): Whether to download if not available locally

**Example:**
```
Load the German Credit dataset from OpenXAI
```

### 2. Model Management

#### `list_models`
List available pre-trained models in OpenXAI.

**Parameters:**
- `dataset_name` (optional): Filter models by dataset
- `model_type` (optional): Filter by model type (`ann`, `lr`, `rf`, `svm`, `xgb`, `all`)

**Example:**
```
List all neural network models available in OpenXAI
```

#### `load_model`
Load a pre-trained model from OpenXAI.

**Parameters:**
- `data_name`: Name of the dataset the model was trained on
- `ml_model`: Type of ML model (`ann`, `lr`, `rf`, `svm`, `xgb`)
- `pretrained` (optional): Whether to load pretrained model

**Example:**
```
Load a neural network model trained on the German Credit dataset
```

### 3. Explanation Methods

#### `list_explainers`
List available explanation methods in OpenXAI.

**Parameters:**
- `method_type` (optional): Filter by method type (`lime`, `shap`, `integrated_gradients`, `gradcam`, `all`)

**Example:**
```
Show me all available explanation methods in OpenXAI
```

#### `generate_explanation`
Generate explanations for model predictions.

**Parameters:**
- `method`: Explanation method (`lime`, `shap`, `integrated_gradients`, etc.)
- `data_sample`: JSON string of input data to explain
- `model_info`: Model information object

**Example:**
```
Generate LIME explanations for a sample from the German Credit dataset
```

### 4. Evaluation Metrics

#### `list_metrics`
List available evaluation metrics in OpenXAI.

**Parameters:**
- `metric_type` (optional): Filter by metric type (`faithfulness`, `stability`, `fairness`, `all`)

**Example:**
```
Show me all faithfulness metrics available in OpenXAI
```

#### `evaluate_explanation`
Evaluate explanation quality using OpenXAI metrics.

**Parameters:**
- `metric`: Evaluation metric (`PGI`, `PGU`, `RIS`, etc.)
- `explanation`: JSON string of explanation to evaluate
- `model_info`: Model information object

**Example:**
```
Evaluate an explanation using the PGI metric
```

### 5. Leaderboards

#### `get_leaderboard`
Get leaderboard results for explanation methods.

**Parameters:**
- `dataset` (optional): Dataset name
- `metric` (optional): Metric to sort by

**Example:**
```
Show me the leaderboard for the German Credit dataset
```

### 6. Framework Information

#### `get_framework_info`
Get information about the OpenXAI framework.

**Parameters:**
- `info_type` (optional): Type of information (`overview`, `features`, `paper`, `installation`, `quickstart`)

**Example:**
```
Tell me about the OpenXAI framework
```

## Model Deployment Guide

### 🚀 Deployment Options

OpenXAI supports multiple deployment options to suit different needs and budgets:

#### 1. **Xnode (Recommended for Beginners)**
- ✅ **Decentralized**: True decentralized deployment
- ✅ **Web3 Ready**: Built for blockchain integration  
- ✅ **No KYC**: Quick setup without identity verification
- 💰 **Cost**: Free tier available
- 🔧 **Setup**: One-click deployment

**Quick Start:**
```bash
# Deploy to Xnode
npm run deploy:xnode

# Or manually:
curl -X POST https://api.xnode.ai/deploy \
  -H "Content-Type: application/json" \
  -d '{
    "project": "openxai-mcp",
    "model": "your-model-name",
    "framework": "openxai"
  }'
```

#### 2. **Xnode DVM (Advanced)**
- ❌ **Centralized**: Traditional cloud deployment
- ✅ **Web3 Ready**: Crypto payment integration
- ✅ **No KYC**: Anonymous deployment
- 💰 **Cost**: 500 OPNX tokens
- 🔧 **Performance**: Higher compute resources

#### 3. **Vultr (Washington)**
- ❌ **Centralized**: Traditional cloud provider
- ✅ **Web3 Ready**: Cryptocurrency payments accepted
- ✅ **No KYC**: Minimal verification required
- 💰 **Cost**: $655/month
- 🌍 **Location**: Washington DC, USA

#### 4. **AWS EC2 (Hong Kong)**
- ❌ **Centralized**: Amazon Web Services
- ✅ **Web3 Ready**: Supports Web3 applications
- ✅ **No KYC**: Standard AWS verification
- 💰 **Cost**: $1,321/month
- 🌍 **Location**: Hong Kong

#### 5. **Google Cloud (NYC)**
- ❌ **Centralized**: Google Cloud Platform
- ✅ **Web3 Ready**: Web3 compatible
- ✅ **No KYC**: Google account required
- 💰 **Cost**: $1,745/month
- 🌍 **Location**: New York City

#### 6. **Xnode One (Hardware)** - Coming Soon
- ✅ **Decentralized**: Physical hardware nodes
- ✅ **Web3 Ready**: Native Web3 integration
- ✅ **No KYC**: Completely anonymous
- 💰 **Cost**: $0/month (hardware purchase required)
- 🔧 **Control**: Full hardware control

### 🔗 OpenXAI Studio Integration

#### Quick OpenXAI Studio Deployment

Deploy your models using OpenXAI Studio's decentralized platform:

```bash
# 1. Setup OpenXAI Studio integration
npm run setup:openxai-studio

# 2. Connect your Web3 wallet
npm run connect:wallet

# 3. Deploy with OpenXAI Studio
npm run deploy:openxai-studio
```

#### Available Models in OpenXAI Studio

- **DeepSeek R1** - Advanced reasoning model
- **Code Llama** - Meta's code generation model  
- **Gamma 2** - Google's latest model
- **Llama 3.2 Vision** - 90B parameter vision model
- **Embedding Models** - For text embeddings
- **Code Models** - Specialized for code generation

#### Deployment Process

**🌐 Visit OpenXAI Studio App Store**: https://studio.openxai.org/app-store

1. **Connect Wallet**: Web3 wallet connection for decentralized access
2. **Browse App Store**: Explore models in categories (General, Vision, Embedding, Code)
3. **Select Model**: Choose from popular models:
   - **DeepSeek R1** (1.5b, 7b, 8b, 14b, 32b, 70b, 671b)
   - **Code Llama** (7b, 13b, 34b, 70b) 
   - **Qwen 2.5** (0.5b, 1.5b, 3b, 7b, 14b, 32b, 72b)
   - **Llama 3.2 Vision** (11b, 90b)
   - **Gemma 2** (2b, 9b, 27b)
   - And many more...
4. **Choose Parameters**: Select model size based on your needs
5. **Select Deployment Type**: Choose X node or other deployment options
6. **Deploy**: Hit deployment button (2-5 minutes)
7. **Access Deployments**: Go to `/deployments` section
8. **Login**: Use provided credentials to access your deployed model

### 🎯 Step-by-Step Deployment

#### Option 1: Interactive Deployment Wizard

```bash
# Run the deployment wizard
npm run deploy

# Follow the prompts:
# 1. Select deployment provider (Xnode, Vultr, AWS, etc.)
# 2. Choose your model configuration
# 3. Set up authentication (if required)
# 4. Configure scaling options
# 5. Deploy and get your endpoint URL
```

#### Option 2: Manual Configuration

1. **Choose Your Provider**
   ```bash
   # For Xnode (Free tier)
   npm run deploy:xnode --tier=free
   
   # For Vultr
   npm run deploy:vultr --region=washington
   
   # For AWS
   npm run deploy:aws --region=hk
   
   # For Google Cloud
   npm run deploy:gcp --region=nyc
   ```

2. **Configure Model Settings**
   ```json
   {
     "model": {
       "name": "openxai-explainer",
       "version": "1.0.0",
       "framework": "openxai",
       "explainer": "shap",
       "dataset": "german"
     },
     "deployment": {
       "provider": "xnode",
       "tier": "free",
       "scaling": "auto"
     }
   }
   ```

3. **Set Up Authentication**
   ```bash
   # For providers requiring authentication
   npm run auth:setup
   
   # Follow provider-specific login flow
   # Get your deployment credentials
   ```

4. **Deploy and Test**
   ```bash
   # Deploy your model
   npm run deploy:execute
   
   # Test your deployment
   npm run test:deployment
   
   # Get your endpoint URL
   npm run get:endpoint
   ```

### 🔐 Authentication & Access

#### User Login Flow

Similar to Hugging Face, users can easily access deployed models:

1. **Visit Your Model Interface**
   ```
   https://your-deployment-url/ui
   ```

2. **Login Options**
   - **Web3 Wallet**: Connect with MetaMask, WalletConnect
   - **Traditional**: Email/password or OAuth
   - **API Key**: For programmatic access

3. **Model Access**
   - Interactive web interface
   - API endpoints
   - SDK integration

#### Quick Access Example

```javascript
// JavaScript SDK
import { OpenXAIClient } from 'openxai-client';

const client = new OpenXAIClient({
  endpoint: 'https://your-deployment-url',
  apiKey: 'your-api-key'
});

// Generate explanation
const explanation = await client.explain({
  method: 'shap',
  data: [1, 0, 1, 0, 1],
  model: 'german-credit'
});
```

### 📊 Deployment Monitoring

#### Real-time Metrics

Monitor your deployed models:

```bash
# Check deployment status
npm run status

# View usage analytics
npm run analytics

# Monitor performance
npm run monitor
```

#### Cost Optimization

```bash
# Analyze deployment costs
npm run cost:analyze

# Optimize for budget
npm run cost:optimize

# Set up alerts
npm run alerts:setup
```

### 🔄 Switching Between Deployments

Easily switch between different deployment providers:

```bash
# List current deployments
npm run list:deployments

# Switch to different provider
npm run switch:provider --to=xnode

# Migrate between providers
npm run migrate --from=aws --to=xnode
```

## Usage Examples

### Basic Dataset and Model Loading

```
Load the German Credit dataset and list available models for it
```

### Explanation Generation Workflow

```
1. Load the Adult Income dataset
2. Load an XGBoost model trained on this dataset
3. Generate SHAP explanations for a sample
4. Evaluate the explanations using the PGI metric
```

### Benchmarking Comparison

```
1. List all explanation methods available in OpenXAI
2. Show the evaluation metrics for faithfulness
3. Get the current leaderboard for the COMPAS dataset
```

### Deployment Workflow

```
1. Visit OpenXAI Studio App Store: https://studio.openxai.org/app-store
2. Connect your Web3 wallet (MetaMask, WalletConnect, etc.)
3. Browse and select your desired model from the app store
4. Choose model parameters (1.5b, 7b, 32b, etc.)
5. Select deployment type (X node for decentralized deployment)
6. Click deploy button and wait 2-5 minutes
7. Go to /deployments section to access your deployment
8. Use provided credentials to login to your deployed model
9. Start using your decentralized AI model for your projects!
```

### OpenXAI Studio Integration Guide

When a user wants to deploy a model, here's the complete process:

#### 🚀 **Quick Start Guide**

1. **Visit the App Store**: https://studio.openxai.org/app-store
2. **Connect Wallet**: Click "Connect Wallet" button
3. **Browse Models**: Explore categories:
   - **General**: qwen, deepseek-r1, llama models
   - **Vision**: llama-3.2-vision, qwen2-vl
   - **Embedding**: text-embedding models
   - **Code**: codelama, qwen2.5-coder
4. **Select Model**: Click on your preferred model
5. **Choose Parameters**: Select size (1.5b, 7b, 32b, etc.)
6. **Configure Deployment**: Choose X node (decentralized) or other options
7. **Deploy**: Click deploy button
8. **Access**: Go to `/deployments` and use your credentials

#### 🔧 **Using This MCP**

Our MCP helps you prepare for OpenXAI Studio deployment:

```bash
# 1. Setup your preferences
npm run setup:openxai-studio

# 2. Connect wallet simulation
npm run connect:wallet

# 3. Get deployment guidance
npm run deploy:openxai-studio

# 4. Check deployment status
npm run status
```

## Development

### Running the Server

```bash
# Start the server
npm start

# Development mode with auto-reload
npm run dev

# Run tests
npm test
```

### Project Structure

```
openxai-mcp/
├── index.js          # Main MCP server implementation
├── package.json      # Node.js dependencies
├── README.md         # This file
└── test.js          # Test suite
```

## OpenXAI Framework

This MCP server is built on top of the OpenXAI framework:

- **Website**: https://open-xai.github.io/
- **GitHub**: https://github.com/AI4LIFE-GROUP/OpenXAI
- **Paper**: https://arxiv.org/abs/2206.11104

### Key OpenXAI Components

1. **Data Loaders**: Load datasets with train/test splits
2. **Model Loading**: Access pre-trained models
3. **Explainers**: Generate explanations using various methods
4. **Evaluators**: Assess explanation quality
5. **Leaderboards**: Compare method performance

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Citation

If you use OpenXAI in your research, please cite:

```bibtex
@inproceedings{agarwal2022openxai,
  title={OpenXAI: Towards a Transparent Evaluation of Model Explanations},
  author={Agarwal, Chirag and Krishna, Satyapriya and Saxena, Eshika and Pawelczyk, Martin and Johnson, Nari and Puri, Isha and Zitnik, Marinka and Lakkaraju, Himabindu},
  booktitle={Thirty-sixth Conference on Neural Information Processing Systems Datasets and Benchmarks Track},
  year={2022}
}
```

## Support

For issues and questions:
- Create an issue on GitHub
- Check the [OpenXAI documentation](https://open-xai.github.io/)
- Contact the OpenXAI team at openxaibench@gmail.com

## Acknowledgments

- OpenXAI team for the excellent framework
- Model Context Protocol for the standard interface
- All contributors to the explainable AI community 