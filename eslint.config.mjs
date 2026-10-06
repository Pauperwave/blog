// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

// Righe che sono solo una stringa (liste di classi Tailwind, testi lunghi), con al piu un prefisso
// "chiave:", "const x =" o un operatore (? : || && +) davanti: spezzarle peggiora la leggibilita
const LONE_STRING_LINE = /^\s*(?:(?:export\s+)?(?:const|let)\s+[\w$]+\s*=\s*|[\w$]+\s*[=:]\s*|[?:|&+]+\s*)?(['"`]).*\1[,;)]*$/.source

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

    // max 100 caratteri per riga; esenti URL, regex, le righe che sono solo una stringa
    // e (nei template) valori degli attributi e testo
    'max-len': [
      'error',
      {
        code: 100,
        ignoreUrls: true,
        ignoreRegExpLiterals: true,
        ignorePattern: LONE_STRING_LINE
      }
    ],

    // boolean espliciti ammessi
    'vue/no-boolean-default': 'off',

    // componenti vuoti sempre self-closing
    'vue/html-self-closing': [
      'error',
      {
        html: {
          void: 'never',       // <br />, <img /> ecc. restano void
          normal: 'always',    // i tag HTML normali possono essere self-closing (div, slot ecc.)
          component: 'always'  // componenti custom self-closing
        },
        svg: 'always',
        math: 'always'
      }
    ]
  }
}, {
  // nei .vue la regola che conosce i template sostituisce quella del core
  files: ['**/*.vue'],
  rules: {
    'max-len': 'off',
    'vue/max-len': [
      'error',
      {
        code: 100,
        template: 100,
        ignoreUrls: true,
        ignoreRegExpLiterals: true,
        ignoreHTMLAttributeValues: true,
        ignoreHTMLTextContents: true,
        ignorePattern: LONE_STRING_LINE
      }
    ]
  }
})
