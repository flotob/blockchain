import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodePolyfills from 'rollup-plugin-node-polyfills';

export default {
  input: 'src/vendor.js',
  output: {
    file: 'assets/js/vendor.js',
    format: 'iife',
    name: 'vendor',
    sourcemap: true,
    globals: {
      'fs': 'null',
      'path': 'null',
      'url': 'null',
      'worker_threads': 'null'
    }
  },
  plugins: [
    nodePolyfills(),
    resolve({
      browser: true,
      preferBuiltins: false
    }),
    commonjs({
      // PDF.js has some conditional requires that we need to handle
      ignore: ['canvas', 'worker_threads']
    }),
    json()
  ]
}; 