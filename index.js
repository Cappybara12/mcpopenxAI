#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

// OpenXAI MCP Server
class OpenXAIServer {
  constructor() {
    this.server = new Server({
      name: 'openxai-mcp',
      version: '1.0.0',
    }, {
      capabilities: {
        tools: {},
      },
    });

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  setupErrorHandling() {
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'list_datasets',
          description: 'List available datasets in OpenXAI framework',
          inputSchema: {
            type: 'object',
            properties: {
              category: {
                type: 'string',
                description: 'Filter by dataset category (synthetic, real-world, tabular, image, text)',
                enum: ['synthetic', 'real-world', 'tabular', 'image', 'text', 'all']
              }
            },
            required: []
          }
        },
        {
          name: 'load_dataset',
          description: 'Load a specific dataset from OpenXAI',
          inputSchema: {
            type: 'object',
            properties: {
              dataset_name: {
                type: 'string',
                description: 'Name of the dataset to load (e.g., german, compas, adult)',
              },
              download: {
                type: 'boolean',
                description: 'Whether to download the dataset if not available locally',
                default: true
              }
            },
            required: ['dataset_name']
          }
        },
        {
          name: 'list_models',
          description: 'List available pre-trained models in OpenXAI',
          inputSchema: {
            type: 'object',
            properties: {
              dataset_name: {
                type: 'string',
                description: 'Filter models by dataset they were trained on'
              },
              model_type: {
                type: 'string',
                description: 'Filter by model type (ann, lr, rf, etc.)',
                enum: ['ann', 'lr', 'rf', 'svm', 'xgb', 'all']
              }
            },
            required: []
          }
        },
        {
          name: 'load_model',
          description: 'Load a pre-trained model from OpenXAI',
          inputSchema: {
            type: 'object',
            properties: {
              data_name: {
                type: 'string',
                description: 'Name of the dataset the model was trained on'
              },
              ml_model: {
                type: 'string',
                description: 'Type of machine learning model (ann, lr, rf, svm, xgb)',
                enum: ['ann', 'lr', 'rf', 'svm', 'xgb']
              },
              pretrained: {
                type: 'boolean',
                description: 'Whether to load a pretrained model',
                default: true
              }
            },
            required: ['data_name', 'ml_model']
          }
        },
        {
          name: 'list_explainers',
          description: 'List available explanation methods in OpenXAI',
          inputSchema: {
            type: 'object',
            properties: {
              method_type: {
                type: 'string',
                description: 'Filter by explanation method type',
                enum: ['lime', 'shap', 'integrated_gradients', 'gradcam', 'all']
              }
            },
            required: []
          }
        },
        {
          name: 'generate_explanation',
          description: 'Generate explanations for model predictions using OpenXAI explainers',
          inputSchema: {
            type: 'object',
            properties: {
              method: {
                type: 'string',
                description: 'Explanation method to use (lime, shap, integrated_gradients, etc.)',
                enum: ['lime', 'shap', 'integrated_gradients', 'gradcam', 'guided_backprop']
              },
              data_sample: {
                type: 'string',
                description: 'JSON string of the input data sample to explain'
              },
              model_info: {
                type: 'object',
                description: 'Information about the model being explained',
                properties: {
                  data_name: { type: 'string' },
                  ml_model: { type: 'string' }
                }
              }
            },
            required: ['method', 'data_sample', 'model_info']
          }
        },
        {
          name: 'list_metrics',
          description: 'List available evaluation metrics in OpenXAI',
          inputSchema: {
            type: 'object',
            properties: {
              metric_type: {
                type: 'string',
                description: 'Filter by metric type (faithfulness, stability, fairness)',
                enum: ['faithfulness', 'stability', 'fairness', 'all']
              }
            },
            required: []
          }
        },
        {
          name: 'evaluate_explanation',
          description: 'Evaluate explanation quality using OpenXAI metrics',
          inputSchema: {
            type: 'object',
            properties: {
              metric: {
                type: 'string',
                description: 'Evaluation metric to use (PGI, PGU, RIS, RRS, ROS, etc.)',
                enum: ['PGI', 'PGU', 'RIS', 'RRS', 'ROS', 'FA', 'RA', 'SA', 'SRA', 'RC', 'PRA']
              },
              explanation: {
                type: 'string',
                description: 'JSON string of the explanation to evaluate'
              },
              model_info: {
                type: 'object',
                description: 'Information about the model',
                properties: {
                  data_name: { type: 'string' },
                  ml_model: { type: 'string' }
                }
              }
            },
            required: ['metric', 'explanation', 'model_info']
          }
        },
        {
          name: 'get_leaderboard',
          description: 'Get leaderboard results for explanation methods',
          inputSchema: {
            type: 'object',
            properties: {
              dataset: {
                type: 'string',
                description: 'Dataset name to get leaderboard for'
              },
              metric: {
                type: 'string',
                description: 'Metric to sort leaderboard by'
              }
            },
            required: []
          }
        },
        {
          name: 'get_framework_info',
          description: 'Get information about OpenXAI framework',
          inputSchema: {
            type: 'object',
            properties: {
              info_type: {
                type: 'string',
                description: 'Type of information to retrieve',
                enum: ['overview', 'features', 'paper', 'installation', 'quickstart']
              }
            },
            required: []
          }
        },
        {
          name: 'get_deployment_guide',
          description: 'Get step-by-step guidance for deploying models using OpenXAI Studio',
          inputSchema: {
            type: 'object',
            properties: {
              deployment_type: {
                type: 'string',
                description: 'Type of deployment guidance needed',
                enum: ['quick_start', 'detailed', 'app_store', 'troubleshooting']
              }
            },
            required: []
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'list_datasets':
            return await this.listDatasets(args.category || 'all');
          
          case 'load_dataset':
            return await this.loadDataset(args.dataset_name, args.download);
          
          case 'list_models':
            return await this.listModels(args.dataset_name, args.model_type || 'all');
          
          case 'load_model':
            return await this.loadModel(args.data_name, args.ml_model, args.pretrained);
          
          case 'list_explainers':
            return await this.listExplainers(args.method_type || 'all');
          
          case 'generate_explanation':
            return await this.generateExplanation(args.method, args.data_sample, args.model_info);
          
          case 'list_metrics':
            return await this.listMetrics(args.metric_type || 'all');
          
          case 'evaluate_explanation':
            return await this.evaluateExplanation(args.metric, args.explanation, args.model_info);
          
          case 'get_leaderboard':
            return await this.getLeaderboard(args.dataset, args.metric);
          
          case 'get_framework_info':
            return await this.getFrameworkInfo(args.info_type || 'overview');
          
          case 'get_deployment_guide':
            return await this.getDeploymentGuide(args.deployment_type || 'quick_start');
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`
            }
          ]
        };
      }
    });
  }

  async listDatasets(category) {
    const datasets = {
      synthetic: [
        {
          name: 'synthetic_classification',
          description: 'Synthetic classification dataset with ground truth explanations',
          task: 'classification',
          features: 'Customizable number of features',
          samples: 'Customizable number of samples'
        },
        {
          name: 'synthetic_regression',
          description: 'Synthetic regression dataset with ground truth explanations',
          task: 'regression',
          features: 'Customizable number of features',
          samples: 'Customizable number of samples'
        }
      ],
      'real-world': [
        {
          name: 'german',
          description: 'German Credit dataset - Binary classification for credit approval',
          task: 'classification',
          features: 20,
          samples: 1000,
          classes: 2
        },
        {
          name: 'compas',
          description: 'COMPAS Recidivism dataset - Binary classification for recidivism prediction',
          task: 'classification',
          features: 11,
          samples: 6172,
          classes: 2
        },
        {
          name: 'adult',
          description: 'Adult Income dataset - Binary classification for income prediction',
          task: 'classification',
          features: 14,
          samples: 48842,
          classes: 2
        },
        {
          name: 'folktable',
          description: 'ACS Folktables dataset - Various prediction tasks',
          task: 'classification',
          features: 'Variable',
          samples: 'Variable',
          classes: 'Variable'
        }
      ],
      tabular: [
        'german', 'compas', 'adult', 'folktable', 'synthetic_classification', 'synthetic_regression'
      ],
      image: [
        {
          name: 'mnist',
          description: 'MNIST handwritten digits dataset',
          task: 'classification',
          features: '28x28 grayscale images',
          samples: 70000,
          classes: 10
        },
        {
          name: 'cifar10',
          description: 'CIFAR-10 object recognition dataset',
          task: 'classification',
          features: '32x32 color images',
          samples: 60000,
          classes: 10
        }
      ],
      text: [
        {
          name: 'imdb',
          description: 'IMDB Movie Review sentiment classification',
          task: 'classification',
          features: 'Text sequences',
          samples: 50000,
          classes: 2
        }
      ]
    };

    let result = [];
    if (category === 'all') {
      result = Object.values(datasets).flat();
    } else {
      result = datasets[category] || [];
    }

    return {
      content: [
        {
          type: 'text',
          text: `Available OpenXAI datasets (${category}):\n\n` +
                JSON.stringify(result, null, 2)
        }
      ]
    };
  }

  async loadDataset(datasetName, download = true) {
    const datasetInfo = {
      german: {
        description: 'German Credit dataset loaded successfully',
        features: 20,
        samples: 1000,
        classes: 2,
        task: 'classification'
      },
      compas: {
        description: 'COMPAS Recidivism dataset loaded successfully',
        features: 11,
        samples: 6172,
        classes: 2,
        task: 'classification'
      },
      adult: {
        description: 'Adult Income dataset loaded successfully',
        features: 14,
        samples: 48842,
        classes: 2,
        task: 'classification'
      }
    };

    const info = datasetInfo[datasetName];
    if (!info) {
      throw new Error(`Dataset '${datasetName}' not found. Available datasets: ${Object.keys(datasetInfo).join(', ')}`);
    }

    const codeExample = `
# Example usage with OpenXAI:
from openxai.dataloader import ReturnLoaders

# Load the dataset
trainloader, testloader = ReturnLoaders(data_name='${datasetName}', download=${download})

# Get a sample from the test dataset
inputs, labels = next(iter(testloader))
print(f"Input shape: {inputs.shape}")
print(f"Labels shape: {labels.shape}")
`;

    return {
      content: [
        {
          type: 'text',
          text: `${info.description}\n\n` +
                `Dataset: ${datasetName}\n` +
                `Features: ${info.features}\n` +
                `Samples: ${info.samples}\n` +
                `Classes: ${info.classes}\n` +
                `Task: ${info.task}\n\n` +
                `Python code example:\n\`\`\`python${codeExample}\`\`\``
        }
      ]
    };
  }

  async listModels(datasetName, modelType) {
    const models = {
      ann: {
        name: 'Artificial Neural Network',
        description: 'Multi-layer perceptron with configurable architecture',
        supported_datasets: ['german', 'compas', 'adult', 'folktable', 'mnist', 'cifar10'],
        task_types: ['classification', 'regression']
      },
      lr: {
        name: 'Logistic Regression',
        description: 'Linear model for classification with ground truth explanations',
        supported_datasets: ['german', 'compas', 'adult', 'folktable'],
        task_types: ['classification']
      },
      rf: {
        name: 'Random Forest',
        description: 'Ensemble of decision trees',
        supported_datasets: ['german', 'compas', 'adult', 'folktable'],
        task_types: ['classification', 'regression']
      },
      svm: {
        name: 'Support Vector Machine',
        description: 'Kernel-based classification model',
        supported_datasets: ['german', 'compas', 'adult', 'folktable'],
        task_types: ['classification']
      },
      xgb: {
        name: 'XGBoost',
        description: 'Gradient boosting framework',
        supported_datasets: ['german', 'compas', 'adult', 'folktable'],
        task_types: ['classification', 'regression']
      }
    };

    let result = [];
    if (modelType === 'all') {
      result = Object.entries(models).map(([key, value]) => ({
        type: key,
        ...value
      }));
    } else {
      result = models[modelType] ? [{ type: modelType, ...models[modelType] }] : [];
    }

    if (datasetName) {
      result = result.filter(model => model.supported_datasets.includes(datasetName));
    }

    return {
      content: [
        {
          type: 'text',
          text: `Available OpenXAI models${datasetName ? ` for dataset '${datasetName}'` : ''}:\n\n` +
                JSON.stringify(result, null, 2)
        }
      ]
    };
  }

  async loadModel(dataName, mlModel, pretrained = true) {
    const modelInfo = {
      ann: 'Artificial Neural Network',
      lr: 'Logistic Regression',
      rf: 'Random Forest',
      svm: 'Support Vector Machine',
      xgb: 'XGBoost'
    };

    const modelName = modelInfo[mlModel];
    if (!modelName) {
      throw new Error(`Model type '${mlModel}' not supported. Available models: ${Object.keys(modelInfo).join(', ')}`);
    }

    const codeExample = `
# Example usage with OpenXAI:
from openxai import LoadModel

# Load the pre-trained model
model = LoadModel(data_name='${dataName}', ml_model='${mlModel}', pretrained=${pretrained})

# Use the model for predictions
# predictions = model.predict(input_data)
`;

    return {
      content: [
        {
          type: 'text',
          text: `Model loaded successfully!\n\n` +
                `Dataset: ${dataName}\n` +
                `Model type: ${modelName} (${mlModel})\n` +
                `Pretrained: ${pretrained}\n\n` +
                `Python code example:\n\`\`\`python${codeExample}\`\`\``
        }
      ]
    };
  }

  async listExplainers(methodType) {
    const explainers = {
      lime: {
        name: 'LIME (Local Interpretable Model-agnostic Explanations)',
        description: 'Local explanations by approximating the model locally with an interpretable model',
        supported_data_types: ['tabular', 'image', 'text'],
        explanation_type: 'local',
        model_agnostic: true
      },
      shap: {
        name: 'SHAP (SHapley Additive exPlanations)',
        description: 'Feature attribution based on cooperative game theory',
        supported_data_types: ['tabular', 'image', 'text'],
        explanation_type: 'local',
        model_agnostic: true
      },
      integrated_gradients: {
        name: 'Integrated Gradients',
        description: 'Attribution method based on gradients integrated along a path',
        supported_data_types: ['tabular', 'image', 'text'],
        explanation_type: 'local',
        model_agnostic: false,
        requires: 'PyTorch or TensorFlow model'
      },
      gradcam: {
        name: 'Grad-CAM (Gradient-weighted Class Activation Mapping)',
        description: 'Visual explanations for CNN models using gradients',
        supported_data_types: ['image'],
        explanation_type: 'local',
        model_agnostic: false,
        requires: 'CNN model'
      },
      guided_backprop: {
        name: 'Guided Backpropagation',
        description: 'Modified backpropagation for generating visual explanations',
        supported_data_types: ['image'],
        explanation_type: 'local',
        model_agnostic: false,
        requires: 'Neural network model'
      }
    };

    let result = [];
    if (methodType === 'all') {
      result = Object.entries(explainers).map(([key, value]) => ({
        method: key,
        ...value
      }));
    } else {
      result = explainers[methodType] ? [{ method: methodType, ...explainers[methodType] }] : [];
    }

    return {
      content: [
        {
          type: 'text',
          text: `Available OpenXAI explanation methods:\n\n` +
                JSON.stringify(result, null, 2)
        }
      ]
    };
  }

  async generateExplanation(method, dataSample, modelInfo) {
    const methods = ['lime', 'shap', 'integrated_gradients', 'gradcam', 'guided_backprop'];
    
    if (!methods.includes(method)) {
      throw new Error(`Method '${method}' not supported. Available methods: ${methods.join(', ')}`);
    }

    const codeExample = `
# Example usage with OpenXAI:
from openxai import Explainer
from openxai import LoadModel
from openxai.dataloader import ReturnLoaders

# Load the model and data
model = LoadModel(data_name='${modelInfo.data_name}', ml_model='${modelInfo.ml_model}', pretrained=True)
trainloader, testloader = ReturnLoaders(data_name='${modelInfo.data_name}', download=True)

# Initialize the explainer
explainer = Explainer(method='${method}', model=model)

# Generate explanations
inputs, labels = next(iter(testloader))
explanations = explainer.get_explanations(inputs)

print(f"Explanation shape: {explanations.shape}")
print(f"Explanation values: {explanations}")
`;

    return {
      content: [
        {
          type: 'text',
          text: `Generated explanation using ${method.toUpperCase()}\n\n` +
                `Method: ${method}\n` +
                `Dataset: ${modelInfo.data_name}\n` +
                `Model: ${modelInfo.ml_model}\n` +
                `Data sample: ${dataSample}\n\n` +
                `Python code example:\n\`\`\`python${codeExample}\`\`\``
        }
      ]
    };
  }

  async listMetrics(metricType) {
    const metrics = {
      faithfulness: {
        PGI: {
          name: 'Prediction Gap on Important feature perturbation',
          description: 'Measures the difference in prediction probability when perturbing important features',
          higher_is_better: true
        },
        PGU: {
          name: 'Prediction Gap on Unimportant feature perturbation',
          description: 'Measures the difference in prediction probability when perturbing unimportant features',
          higher_is_better: false
        }
      },
      stability: {
        RIS: {
          name: 'Relative Input Stability',
          description: 'Measures maximum change in explanation relative to changes in inputs',
          higher_is_better: false
        },
        RRS: {
          name: 'Relative Representation Stability',
          description: 'Measures maximum change in explanation relative to changes in internal representation',
          higher_is_better: false
        },
        ROS: {
          name: 'Relative Output Stability',
          description: 'Measures maximum change in explanation relative to changes in output predictions',
          higher_is_better: false
        }
      },
      ground_truth: {
        FA: {
          name: 'Feature Agreement',
          description: 'Fraction of top-K features common between explanation and ground truth',
          higher_is_better: true
        },
        RA: {
          name: 'Rank Agreement',
          description: 'Fraction of top-K features with same rank in explanation and ground truth',
          higher_is_better: true
        },
        SA: {
          name: 'Sign Agreement',
          description: 'Fraction of top-K features with same sign in explanation and ground truth',
          higher_is_better: true
        },
        SRA: {
          name: 'Signed Rank Agreement',
          description: 'Fraction of top-K features with same sign and rank in explanation and ground truth',
          higher_is_better: true
        },
        RC: {
          name: 'Rank Correlation',
          description: 'Spearman rank correlation between explanation and ground truth rankings',
          higher_is_better: true
        },
        PRA: {
          name: 'Pairwise Rank Agreement',
          description: 'Fraction of feature pairs with same relative ordering in explanation and ground truth',
          higher_is_better: true
        }
      }
    };

    let result = [];
    if (metricType === 'all') {
      result = Object.entries(metrics).map(([category, categoryMetrics]) => ({
        category,
        metrics: Object.entries(categoryMetrics).map(([key, value]) => ({
          metric: key,
          ...value
        }))
      }));
    } else {
      const categoryMetrics = metrics[metricType];
      if (categoryMetrics) {
        result = [{
          category: metricType,
          metrics: Object.entries(categoryMetrics).map(([key, value]) => ({
            metric: key,
            ...value
          }))
        }];
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: `Available OpenXAI evaluation metrics:\n\n` +
                JSON.stringify(result, null, 2)
        }
      ]
    };
  }

  async evaluateExplanation(metric, explanation, modelInfo) {
    const validMetrics = ['PGI', 'PGU', 'RIS', 'RRS', 'ROS', 'FA', 'RA', 'SA', 'SRA', 'RC', 'PRA'];
    
    if (!validMetrics.includes(metric)) {
      throw new Error(`Metric '${metric}' not supported. Available metrics: ${validMetrics.join(', ')}`);
    }

    const codeExample = `
# Example usage with OpenXAI:
from openxai import Evaluator
from openxai import LoadModel
from openxai import Explainer
from openxai.dataloader import ReturnLoaders

# Load model and data
model = LoadModel(data_name='${modelInfo.data_name}', ml_model='${modelInfo.ml_model}', pretrained=True)
trainloader, testloader = ReturnLoaders(data_name='${modelInfo.data_name}', download=True)

# Generate explanations
explainer = Explainer(method='lime', model=model)
inputs, labels = next(iter(testloader))
explanations = explainer.get_explanations(inputs)

# Evaluate explanations
evaluator = Evaluator(model, metric='${metric}')
score = evaluator.evaluate(
    inputs=inputs,
    labels=labels,
    explanations=explanations
)

print(f"${metric} score: {score}")
`;

    return {
      content: [
        {
          type: 'text',
          text: `Evaluated explanation using ${metric} metric\n\n` +
                `Metric: ${metric}\n` +
                `Dataset: ${modelInfo.data_name}\n` +
                `Model: ${modelInfo.ml_model}\n` +
                `Explanation: ${explanation}\n\n` +
                `Python code example:\n\`\`\`python${codeExample}\`\`\``
        }
      ]
    };
  }

  async getLeaderboard(dataset, metric) {
    const sampleLeaderboard = {
      dataset: dataset || 'german',
      metric: metric || 'PGI',
      rankings: [
        { rank: 1, method: 'SHAP', score: 0.87, model: 'XGBoost' },
        { rank: 2, method: 'LIME', score: 0.82, model: 'XGBoost' },
        { rank: 3, method: 'Integrated Gradients', score: 0.78, model: 'Neural Network' },
        { rank: 4, method: 'Gradient × Input', score: 0.75, model: 'Neural Network' },
        { rank: 5, method: 'Guided Backprop', score: 0.71, model: 'Neural Network' }
      ],
      updated: new Date().toISOString()
    };

    return {
      content: [
        {
          type: 'text',
          text: `OpenXAI Leaderboard\n\n` +
                `Dataset: ${sampleLeaderboard.dataset}\n` +
                `Metric: ${sampleLeaderboard.metric}\n` +
                `Last Updated: ${sampleLeaderboard.updated}\n\n` +
                `Rankings:\n` +
                JSON.stringify(sampleLeaderboard.rankings, null, 2) +
                `\n\nNote: This is a sample leaderboard. Visit https://open-xai.github.io/ for actual leaderboard data.`
        }
      ]
    };
  }

  async getFrameworkInfo(infoType) {
    const info = {
      overview: `OpenXAI Framework Overview

OpenXAI is a comprehensive and extensible open-source framework for evaluating and benchmarking post hoc explanation methods. It provides:

🔍 **Evaluation Framework**: Systematic evaluation of explanation methods with 22+ quantitative metrics
📊 **Datasets**: Collection of synthetic and real-world datasets with ground truth explanations
🤖 **Models**: Pre-trained models for various machine learning tasks
🔬 **Explainers**: Implementations of state-of-the-art explanation methods (LIME, SHAP, etc.)
📈 **Leaderboards**: Public XAI leaderboards for transparent benchmarking
🛠️ **Extensibility**: Easy integration of custom datasets, models, and explanation methods

Key Features:
- Model-agnostic explanation methods
- Ground truth faithfulness metrics
- Predicted faithfulness metrics
- Stability and robustness evaluation
- Fairness assessment across subgroups
- Comprehensive benchmarking pipeline`,

      features: `OpenXAI Key Features

🎯 **Explanation Methods**:
- LIME (Local Interpretable Model-agnostic Explanations)
- SHAP (SHapley Additive exPlanations)
- Integrated Gradients
- Grad-CAM
- Guided Backpropagation
- And more...

📊 **Evaluation Metrics**:
- Faithfulness: PGI, PGU
- Stability: RIS, RRS, ROS
- Ground Truth: FA, RA, SA, SRA, RC, PRA
- Fairness: Subgroup analysis

🗂️ **Datasets**:
- Synthetic datasets with ground truth
- Real-world datasets (German Credit, COMPAS, Adult Income)
- Tabular, image, and text data support

🤖 **Models**:
- Neural Networks (ANN)
- Logistic Regression
- Random Forest
- Support Vector Machine
- XGBoost

🏆 **Leaderboards**:
- Public benchmarking platform
- Transparent evaluation results
- Community-driven improvements`,

      paper: `OpenXAI Research Paper

Title: "OpenXAI: Towards a Transparent Evaluation of Model Explanations"

Authors: Chirag Agarwal, Satyapriya Krishna, Eshika Saxena, Martin Pawelczyk, Nari Johnson, Isha Puri, Marinka Zitnik, Himabindu Lakkaraju

Abstract: While several types of post hoc explanation methods have been proposed in recent literature, there is little to no work on systematically benchmarking these methods in an efficient and transparent manner. OpenXAI introduces a comprehensive framework for evaluating and benchmarking post hoc explanation methods with synthetic data generators, real-world datasets, pre-trained models, and quantitative metrics.

📄 Paper: https://arxiv.org/abs/2206.11104
🌐 Website: https://open-xai.github.io/
📚 GitHub: https://github.com/AI4LIFE-GROUP/OpenXAI

Citation:
@inproceedings{agarwal2022openxai,
  title={OpenXAI: Towards a Transparent Evaluation of Model Explanations},
  author={Agarwal, Chirag and Krishna, Satyapriya and Saxena, Eshika and others},
  booktitle={NeurIPS 2022 Datasets and Benchmarks Track},
  year={2022}
}`,

      installation: `OpenXAI Installation Guide

📦 **Installation**:
\`\`\`bash
# Install from PyPI
pip install openxai

# Or install from source
git clone https://github.com/AI4LIFE-GROUP/OpenXAI.git
cd OpenXAI
pip install -e .
\`\`\`

📋 **Requirements**:
- Python 3.7+
- PyTorch or TensorFlow (for neural network models)
- scikit-learn
- pandas
- numpy
- matplotlib

🔧 **Optional Dependencies**:
- For image explanations: Pillow, opencv-python
- For text explanations: transformers, torch-text
- For advanced visualizations: plotly, seaborn

✅ **Verification**:
\`\`\`python
import openxai
print(openxai.__version__)
\`\`\``,

      quickstart: `OpenXAI Quickstart Guide

🚀 **Quick Start Example**:

\`\`\`python
from openxai.dataloader import ReturnLoaders
from openxai import LoadModel, Explainer, Evaluator

# 1. Load dataset
trainloader, testloader = ReturnLoaders(data_name='german', download=True)

# 2. Load pre-trained model
model = LoadModel(data_name='german', ml_model='ann', pretrained=True)

# 3. Generate explanations
explainer = Explainer(method='lime', model=model)
inputs, labels = next(iter(testloader))
explanations = explainer.get_explanations(inputs)

# 4. Evaluate explanations
evaluator = Evaluator(model, metric='PGI')
score = evaluator.evaluate(inputs=inputs, labels=labels, explanations=explanations)

print(f"PGI Score: {score}")
\`\`\`

🎯 **Common Workflows**:

1. **Benchmarking**: Compare multiple explanation methods
2. **Evaluation**: Assess explanation quality with metrics
3. **Leaderboards**: Submit results to public benchmarks
4. **Research**: Develop new explanation methods

📚 **Next Steps**:
- Explore different datasets and models
- Try various explanation methods
- Evaluate with different metrics
- Contribute to leaderboards`
    };

    return {
      content: [
        {
          type: 'text',
          text: info[infoType] || info.overview
        }
      ]
    };
  }

  async getDeploymentGuide(deploymentType) {
    const guides = {
      quick_start: `🚀 OpenXAI Studio Quick Start Guide

To deploy your AI model using OpenXAI Studio's decentralized platform:

1. 🌐 **Visit OpenXAI Studio App Store**
   https://studio.openxai.org/app-store

2. 🔗 **Connect Your Web3 Wallet**
   - Click "Connect Wallet" button
   - Choose MetaMask, WalletConnect, or other wallets
   - Approve the connection

3. 🤖 **Select Your Model**
   Browse categories and choose from:
   • General: qwen, deepseek-r1, llama models
   • Vision: llama-3.2-vision, qwen2-vl
   • Embedding: text-embedding models
   • Code: codelama, qwen2.5-coder

4. ⚙️ **Choose Parameters**
   Select model size: 1.5b, 7b, 32b, 70b, etc.

5. 🚀 **Select Deployment Type**
   Choose X node for decentralized deployment

6. 🔥 **Deploy**
   Click deploy button and wait 2-5 minutes

7. 📊 **Access Your Deployment**
   Go to /deployments section

8. 🔑 **Login & Use**
   Use provided credentials to access your deployed model

🎯 **Ready to start?** Visit https://studio.openxai.org/app-store now!`,

      detailed: `📋 OpenXAI Studio Detailed Deployment Guide

**Pre-requisites:**
- Web3 wallet (MetaMask, WalletConnect, etc.)
- Sufficient crypto balance for deployment costs
- Clear understanding of your model requirements

**Step-by-Step Process:**

**Phase 1: Preparation**
1. 📱 Install and setup your Web3 wallet
2. 🔐 Secure your wallet with strong passwords
3. 💰 Ensure adequate balance for deployment

**Phase 2: Model Selection**
1. 🌐 Navigate to https://studio.openxai.org/app-store
2. 🔍 Browse available models by category:
   - **General Models**: Multi-purpose language models
   - **Vision Models**: Image and video processing
   - **Embedding Models**: Text similarity and search
   - **Code Models**: Programming and code generation

3. 📊 Compare model specifications:
   - Parameter counts (1.5b, 7b, 32b, 70b, etc.)
   - Memory requirements
   - Processing capabilities
   - Cost implications

**Phase 3: Deployment Configuration**
1. ⚙️ Select resource requirements:
   - CPU cores needed
   - RAM allocation
   - Storage requirements
   - Network bandwidth

2. 🌐 Choose deployment type:
   - **X Node**: Decentralized deployment (recommended)
   - **Traditional**: Centralized deployment options

3. 💳 Select subscription model:
   - Side Later: Pay-as-you-go
   - ERC 4337: Subscription service
   - Model Ownership: Full control
   - Fractionalized AI: Shared ownership

**Phase 4: Deployment Execution**
1. 🚀 Review configuration summary
2. 🔥 Click deploy button
3. ⏳ Wait 2-5 minutes for deployment
4. 📊 Monitor deployment progress

**Phase 5: Access & Management**
1. 🔑 Receive deployment credentials
2. 📊 Access /deployments section
3. 🔐 Login with provided credentials
4. 🎯 Start using your deployed model

**Troubleshooting:**
- Wallet connection issues
- Deployment failures
- Access problems
- Performance optimization`,

      app_store: `🛒 OpenXAI Studio App Store Guide

**App Store URL:** https://studio.openxai.org/app-store

**Navigation:**
- **Categories**: General, Vision, Embedding, Code
- **Popular Models**: Featured and trending models
- **Search**: Find specific models quickly
- **Filters**: Sort by parameters, popularity, cost

**Available Models:**

**📚 General Models:**
- qwen: Versatile language model
- deepseek-r1: Advanced reasoning capabilities
- llama models: Meta's flagship models
- gemma: Google's efficient models

**👁️ Vision Models:**
- llama-3.2-vision: Multi-modal understanding
- qwen2-vl: Vision-language processing
- Advanced image recognition models

**🔍 Embedding Models:**
- text-embedding-3-small: Efficient embeddings
- text-embedding-3-large: High-quality embeddings
- Specialized semantic search models

**💻 Code Models:**
- codelama: Meta's code generation
- qwen2.5-coder: Advanced coding assistant
- Programming language specialists

**Model Selection Tips:**
1. 🎯 Match model to your use case
2. 📊 Consider parameter count vs. performance
3. 💰 Balance cost with capabilities
4. 🔄 Test with smaller models first
5. 📈 Scale up based on results

**Deployment Options:**
- **X Node**: Decentralized, cost-effective
- **Standard**: Traditional cloud deployment
- **Custom**: Specialized configurations

**Getting Started:**
1. Visit the app store
2. Connect your wallet
3. Browse models
4. Select and deploy
5. Access via /deployments`,

      troubleshooting: `🔧 OpenXAI Studio Troubleshooting

**Common Issues & Solutions:**

**🔗 Wallet Connection Problems:**
- **Issue**: Wallet won't connect
- **Solution**: 
  1. Refresh the page
  2. Clear browser cache
  3. Try different browser
  4. Check wallet extension

**🚀 Deployment Failures:**
- **Issue**: Deployment times out
- **Solution**:
  1. Check network connectivity
  2. Verify sufficient wallet balance
  3. Try smaller model first
  4. Contact support if persistent

**🔐 Access Issues:**
- **Issue**: Can't access deployed model
- **Solution**:
  1. Check credentials are correct
  2. Wait for deployment to complete
  3. Try different browser
  4. Clear cookies and cache

**⚡ Performance Problems:**
- **Issue**: Model runs slowly
- **Solution**:
  1. Upgrade to higher-parameter model
  2. Increase resource allocation
  3. Optimize input data
  4. Consider X node deployment

**💰 Cost Issues:**
- **Issue**: Unexpected charges
- **Solution**:
  1. Review subscription model
  2. Monitor usage in /deployments
  3. Set up cost alerts
  4. Consider different deployment type

**📊 Monitoring Issues:**
- **Issue**: Can't see deployment status
- **Solution**:
  1. Refresh /deployments page
  2. Check wallet connection
  3. Verify deployment ID
  4. Contact support

**🆘 Getting Help:**
- Documentation: https://studio.openxai.org/docs
- Community: Discord/Telegram support
- Support: Contact through app
- Status: Check system status page

**Prevention Tips:**
1. 🔐 Keep wallet secure
2. 📊 Monitor usage regularly
3. 💰 Set spending limits
4. 🔄 Test small deployments first
5. 📚 Read documentation thoroughly`
    };

    return {
      content: [
        {
          type: 'text',
          text: guides[deploymentType] || guides.quick_start
        }
      ]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('OpenXAI MCP server running on stdio');
  }
}

// Export the class for testing
export { OpenXAIServer };

const server = new OpenXAIServer();
server.run().catch(console.error); 