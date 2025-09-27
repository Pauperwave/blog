// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    files: ['*.vue'],
    rules: {
      'flat/strongly-recommended': 'error',
      'vue/multi-word-component-names': 'error',
      'no-console': 'warn',
      'no-debugger': 'error',
    }
  },
  {
    files: ['*.vue'],
    rules: {
      'vue/multi-word-component-names': 'error'
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