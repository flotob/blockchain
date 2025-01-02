import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodePolyfills from 'rollup-plugin-node-polyfills';

export default {
  input: 'src/vendor.js',
  output: {
    file: 'assets/js/vendor.js',
    format: 'iife',
    name: 'markdownit',
    sourcemap: true
  },
  plugins: [
    nodePolyfills(),
    resolve({
      browser: true,
      preferBuiltins: false
    }),
    commonjs(),
    json()
  ]
}; 