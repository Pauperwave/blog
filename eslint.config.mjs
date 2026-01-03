// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    files: ['*.vue'],
    rules: {
      'flat/strongly-recommended': 'error',
      'vue/multi-word-component-names': 'error',
      'vue/no-multiple-template-root': 'off',
      'vue/max-attributes-per-line': ['error', {
        singleline: 3, // each prop on its own line
        multiline: 1 // also applies to multi-line elements
      }],
      'no-console': 'warn',
      'no-debugger': 'error'
    }
  },
  {
    files: ['app.vue', 'error.vue', 'pages/**/*.vue', 'layouts/**/*.vue'],
    rules: {
      // disable the rule for these files
      'vue/multi-word-component-names': 'off'
    }
  }
)
