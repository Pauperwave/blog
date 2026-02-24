// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    // niente ; dove non serve
    semi: [ 'error', 'never' ],
    'no-extra-semi': 'error',

    'vue/block-order': [
      'error',
      {
        'order': [ [ 'script', 'template' ], 'style' ]
      }
    ],

    // max 3 attributi in una riga se singleline, 1 per riga se multiline
    'vue/max-attributes-per-line': [
      'error',
      {
        singleline: 3,
        multiline: 1
      }
    ],

    // chiusura tag sulla stessa riga
    'vue/html-closing-bracket-newline': [
      'error',
      {
        singleline: 'never',
        multiline: 'always'
      }
    ],

    // indentazione HTML coerente
    'vue/html-indent': [
      'error',
      2,
      {
        attribute: 1,
        baseIndent: 1,
        closeBracket: 0,
        alignAttributesVertically: true
      }
    ],

    // niente riordino automatico degli attributi
    'vue/attributes-order': 'off',

    // oggetti inline negli attributi senza warning
    'vue/max-len': 'off',

    // boolean espliciti ammessi
    'vue/no-boolean-default': 'off',

    // componenti vuoti sempre self-closing
    'vue/html-self-closing': [
      'error',
      {
        html: {
          void: 'never',       // <br />, <img /> ecc. restano void
          normal: 'always',    // tutti i tag HTML normali possono essere self-closing (div, slot ecc.)
          component: 'always'  // componenti custom self-closing
        },
        svg: 'always',
        math: 'always'
      }
    ]
  }
})
