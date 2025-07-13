# OpenXAI MCP Server - Submission Guide

This guide explains how to submit the OpenXAI MCP server to the [cursor.directory/mcp](https://cursor.directory/mcp) directory.

## Server Overview

**Name**: OpenXAI MCP Server  
**Description**: A Model Context Protocol server for OpenXAI, providing comprehensive tools for evaluating and benchmarking post hoc explanation methods in AI models.  
**Category**: Machine Learning / Explainable AI  
**Repository**: https://github.com/yourusername/openxai-mcp  

## Key Features

🔍 **Explanation Methods**
- LIME (Local Interpretable Model-agnostic Explanations)
- SHAP (SHapley Additive exPlanations)
- Integrated Gradients
- Grad-CAM
- Guided Backpropagation

📊 **Evaluation Metrics**
- Faithfulness metrics (PGI, PGU)
- Stability metrics (RIS, RRS, ROS)
- Ground truth metrics (FA, RA, SA, SRA, RC, PRA)
- Fairness analysis across subgroups

🗂️ **Datasets**
- Synthetic datasets with ground truth explanations
- Real-world datasets (German Credit, COMPAS, Adult Income)
- Support for tabular, image, and text data

🤖 **Pre-trained Models**
- Neural Networks, Logistic Regression, Random Forest
- Support Vector Machine, XGBoost

## Installation Instructions

### Prerequisites
- Node.js 18+
- Python 3.7+ with OpenXAI package

### Quick Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/openxai-mcp.git
cd openxai-mcp

# Install dependencies
npm install

# Install OpenXAI Python package
pip install openxai

# Test the server
npm test
```

### Cursor Configuration
Add to your Cursor settings (`~/.cursor/mcp.json`):
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

1. **list_datasets** - List available datasets in OpenXAI
2. **load_dataset** - Load a specific dataset
3. **list_models** - List available pre-trained models
4. **load_model** - Load a specific model
5. **list_explainers** - List explanation methods
6. **generate_explanation** - Generate model explanations
7. **list_metrics** - List evaluation metrics
8. **evaluate_explanation** - Evaluate explanation quality
9. **get_leaderboard** - Get benchmarking results
10. **get_framework_info** - Get OpenXAI framework information

## Usage Examples

### Basic Usage
```
Tell me about the OpenXAI framework
```

### Dataset Exploration
```
List all tabular datasets available in OpenXAI
```

### Model Analysis
```
Load the German Credit dataset and show me available models for it
```

### Explanation Generation
```
Generate LIME explanations for the Adult Income dataset using an XGBoost model
```

### Evaluation
```
Show me all faithfulness metrics available for evaluating explanations
```

### Benchmarking
```
Get the current leaderboard for explanation methods on the COMPAS dataset
```

## Technical Details

- **Framework**: Model Context Protocol (MCP) 0.6.0
- **Language**: JavaScript/Node.js
- **Dependencies**: @modelcontextprotocol/sdk, axios, zod
- **Backend**: OpenXAI Python framework
- **License**: MIT

## Submission Information

### Repository Structure
```
openxai-mcp/
├── index.js          # Main MCP server implementation
├── package.json      # Node.js dependencies
├── README.md         # Comprehensive documentation
├── LICENSE           # MIT license
├── test.js           # Test suite
└── SUBMISSION_GUIDE.md # This file
```

### Validation Checklist
- ✅ All 10 tools implemented and tested
- ✅ Comprehensive documentation with examples
- ✅ MIT license included
- ✅ Package.json with proper metadata
- ✅ Test suite for verification
- ✅ Clear installation instructions
- ✅ Integration with OpenXAI framework

### Tags for Submission
- `explainable-ai`
- `xai`
- `machine-learning`
- `evaluation`
- `benchmarking`
- `lime`
- `shap`
- `openxai`
- `explanation-methods`
- `model-interpretation`

## Benefits for Users

1. **Researchers**: Benchmark explanation methods against established metrics
2. **ML Engineers**: Evaluate model explanations in production systems
3. **Students**: Learn about explainable AI through hands-on examples
4. **Practitioners**: Compare different explanation methods for their use cases

## OpenXAI Integration

This MCP server is built on top of the OpenXAI framework:
- **Website**: https://open-xai.github.io/
- **GitHub**: https://github.com/AI4LIFE-GROUP/OpenXAI
- **Paper**: https://arxiv.org/abs/2206.11104

## Support

For issues and questions:
- GitHub Issues: https://github.com/yourusername/openxai-mcp/issues
- OpenXAI Documentation: https://open-xai.github.io/
- OpenXAI Team: openxaibench@gmail.com

## Submission Steps

1. **Create GitHub Repository**
   - Upload all files to a public GitHub repository
   - Ensure README.md is comprehensive
   - Add proper tags and description

2. **Test Locally**
   - Run `npm test` to verify all tools work
   - Test with Cursor to ensure MCP integration works
   - Verify Python OpenXAI package integration

3. **Submit to cursor.directory/mcp**
   - Visit https://cursor.directory/mcp
   - Click "Submit MCP Server"
   - Provide repository URL and description
   - Include all relevant tags

4. **Follow Up**
   - Monitor for approval/feedback
   - Address any issues or suggestions
   - Update documentation as needed

This OpenXAI MCP server provides a valuable bridge between the powerful OpenXAI framework and the MCP ecosystem, enabling easy access to state-of-the-art explainable AI tools through a standard interface. 