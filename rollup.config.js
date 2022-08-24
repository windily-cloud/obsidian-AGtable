import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import postcss from 'rollup-plugin-postcss'
import { terser } from 'rollup-plugin-terser'

const isProd = process.env.BUILD === 'production'

export default {
  input: './src/main.ts',
  output: {
    dir: '.',
    sourcemap: 'inline',
    sourcemapExcludeSources: isProd,
    format: 'cjs',
    exports: 'default',
  },
  external: ['obsidian'],
  plugins: [
    typescript(),
    nodeResolve({ browser: true }),
    commonjs(),
    terser(),
    postcss({
      extract: true,
      extract: 'styles.css',
    }),
  ],
}
