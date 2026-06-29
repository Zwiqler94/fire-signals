import {rollup} from 'rollup';
import configs from '../rollup.config.mjs';

const buildConfigs = Array.isArray(configs) ? configs : [configs];

try {
  for (const config of buildConfigs) {
    const {output, ...inputOptions} = config;
    const outputs = Array.isArray(output) ? output : [output];
    const bundle = await rollup(inputOptions);
    try {
      for (const outputOptions of outputs) {
        await bundle.write(outputOptions);
      }
    } finally {
      await bundle.close();
    }
  }
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}

process.exit(process.exitCode ?? 0);
