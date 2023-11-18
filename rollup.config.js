import typescript from 'rollup-plugin-typescript2';
import del from 'rollup-plugin-delete'

export default {
  input: 'src/index.ts',
  plugins: [
    del({ targets: ['dist/esm/*', 'dist/cjs/*'], verbose: true }),
    typescript()
  ],
  watch: {
    clearScreen: false
  },
  output: [
    {
      dir: "dist/cjs",
      entryFileNames: '[name].cjs',
      format: 'cjs',
    },
    {
      dir: "dist/esm",
      entryFileNames: '[name].js',
      format: 'es',
    }
  ]
};

