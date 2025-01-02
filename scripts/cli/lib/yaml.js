import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import chalk from 'chalk';

export class YAMLHandler {
  constructor(basePath = process.cwd()) {
    this.basePath = basePath;
  }

  async readYAML(filePath) {
    try {
      const fullPath = path.join(this.basePath, filePath);
      const content = await fs.readFile(fullPath, 'utf8');
      return yaml.load(content);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`YAML file not found: ${filePath}`);
      }
      throw new Error(`Error reading YAML file ${filePath}: ${error.message}`);
    }
  }

  async writeYAML(filePath, data) {
    try {
      const fullPath = path.join(this.basePath, filePath);
      const yamlStr = yaml.dump(data, {
        indent: 2,
        lineWidth: -1,
        noRefs: true
      });
      await fs.writeFile(fullPath, yamlStr, 'utf8');
    } catch (error) {
      throw new Error(`Error writing YAML file ${filePath}: ${error.message}`);
    }
  }

  // Validate required fields in YAML structure
  validateStructure(data, requiredFields, context = '') {
    for (const [field, spec] of Object.entries(requiredFields)) {
      const value = data[field];
      const fieldPath = context ? `${context}.${field}` : field;

      if (value === undefined) {
        throw new Error(`Missing required field: ${fieldPath}`);
      }

      if (spec.type && typeof value !== spec.type) {
        throw new Error(`Invalid type for ${fieldPath}: expected ${spec.type}, got ${typeof value}`);
      }

      if (spec.arrayOf && Array.isArray(value)) {
        value.forEach((item, index) => {
          this.validateStructure(item, spec.arrayOf, `${fieldPath}[${index}]`);
        });
      }
    }
  }
} 