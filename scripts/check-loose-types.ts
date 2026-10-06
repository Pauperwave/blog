#!/usr/bin/env node
/**
 * Reports loose types that switch off type checking:
 *   - `any` (annotations, assertions, generics, `any[]`, ...)
 *   - `as unknown as T` double assertions
 *   - the `Function` and `Object` types
 *   - @ts-ignore / @ts-nocheck / @ts-expect-error directives
 *   - eslint-disable comments for no-explicit-any
 *
 * Reads the script blocks of .vue files too (templates are not checked).
 * Usage: node scripts/check-loose-types.ts [dir ...]   (default: app server shared modules scripts)
 * Exits with 1 when something is found.
 */

import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import ts from 'typescript'
import { parse as parseSfc } from 'vue/compiler-sfc'

type Kind =
  | 'any'
  | 'as unknown as'
  | 'Function type'
  | 'Object type'
  | 'ts directive'
  | 'eslint-disable any'

interface Finding {
  file: string
  line: number
  column: number
  kind: Kind
  code: string
}

const DEFAULT_DIRS = ['app', 'server', 'shared', 'modules', 'scripts']
const SKIPPED_DIRS = new Set(['node_modules', '.nuxt', '.output', '.data', '.vercel', 'dist'])
const SOURCE_FILE = /\.(ts|mts|vue)$/
const TS_DIRECTIVE = /(?:\/\/|\/\*)\s*@ts-(?:ignore|nocheck|expect-error)\b/
const ESLINT_DISABLE_ANY = /(?:\/\/|\/\*)\s*eslint-disable(?:-next-line|-line)?\b[^\n]*no-explicit-any/

function collectFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return SKIPPED_DIRS.has(entry.name) ? [] : collectFiles(path)
    return SOURCE_FILE.test(entry.name) && !entry.name.endsWith('.d.ts') ? [path] : []
  })
}

/** Loose types in TypeScript source; lines are shifted by lineOffset for .vue script blocks. */
function analyze(source: string, file: string, lineOffset: number): Finding[] {
  const findings: Finding[] = []
  const lines = source.split('\n')
  const sourceFile = ts.createSourceFile(
    file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS
  )

  const add = (kind: Kind, position: number) => {
    const { line, character } = sourceFile.getLineAndCharacterOfPosition(position)
    findings.push({
      file,
      line: line + 1 + lineOffset,
      column: character + 1,
      kind,
      code: (lines[line] ?? '').trim()
    })
  }

  const visit = (node: ts.Node) => {
    if (node.kind === ts.SyntaxKind.AnyKeyword) add('any', node.getStart(sourceFile))

    const isDoubleAssertion = ts.isAsExpression(node) && ts.isAsExpression(node.expression)
      && node.expression.type.kind === ts.SyntaxKind.UnknownKeyword
    if (isDoubleAssertion) {
      add('as unknown as', node.getStart(sourceFile))
    }

    if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
      if (node.typeName.text === 'Function') add('Function type', node.getStart(sourceFile))
      if (node.typeName.text === 'Object') add('Object type', node.getStart(sourceFile))
    }

    ts.forEachChild(node, visit)
  }
  visit(sourceFile)

  // Comments are not part of the AST nodes, so these two are matched line by line
  lines.forEach((text, index) => {
    const position = sourceFile.getPositionOfLineAndCharacter(index, 0)
    if (TS_DIRECTIVE.test(text)) add('ts directive', position)
    if (ESLINT_DISABLE_ANY.test(text)) add('eslint-disable any', position)
  })

  return findings
}

function analyzeFile(path: string): Finding[] {
  const source = readFileSync(path, 'utf-8')
  const file = relative(process.cwd(), path).replaceAll('\\', '/')
  if (!path.endsWith('.vue')) return analyze(source, file, 0)

  const { descriptor } = parseSfc(source, { filename: path })
  return [descriptor.script, descriptor.scriptSetup]
    .filter(block => block !== null)
    .flatMap(block => analyze(block.content, file, block.loc.start.line - 1))
}

const dirs = process.argv.slice(2)
const findings = (dirs.length > 0 ? dirs : DEFAULT_DIRS)
  .flatMap(collectFiles)
  .flatMap(analyzeFile)
  .sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.column - b.column)

for (const finding of findings) {
  const position = `${finding.file}:${finding.line}:${finding.column}`
  console.log(`${position}  ${finding.kind.padEnd(18)} ${finding.code}`)
}

if (findings.length === 0) {
  console.log('No loose types found.')
} else {
  const perKind = Object.entries(Object.groupBy(findings, finding => finding.kind))
    .map(([kind, items]) => `${kind}: ${items?.length ?? 0}`)
    .join(', ')
  const noun = findings.length === 1 ? 'loose type' : 'loose types'
  console.log(`\n${findings.length} ${noun} found (${perKind})`)
  process.exitCode = 1
}
