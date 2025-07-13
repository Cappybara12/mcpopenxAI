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