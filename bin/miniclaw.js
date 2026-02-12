#!/usr/bin/env node
/**
 * MiniClaw CLI 入口
 */

import { spawn } from 'node:child_process';

// 使用 tsx 运行 TypeScript 源码
const result = spawn('npx', ['tsx', '--tsconfig', 'tsconfig.json', './src/cli/index.ts', ...process.argv.slice(2)], {
  stdio: 'inherit',
  cwd: process.cwd(),
});

result.on('exit', (code) => {
  process.exit(code ?? 0);
});
