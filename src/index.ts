#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import ignore from 'ignore';
import clipboardy from 'clipboardy';

async function getGitignorePatterns(dir: string): Promise<string[]> {
  const gitignorePath = path.join(dir, '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    return [];
  }
  
  const content = fs.readFileSync(gitignorePath, 'utf-8');
  return content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
}

async function getFilesContent(dir: string): Promise<string> {
  const patterns = await getGitignorePatterns(dir);
  const ig = ignore().add(patterns);
  
  // Always ignore .git directory and node_modules
  ig.add(['.git', 'node_modules']);
  
  // Get all files
  const files = await glob('**/*', {
    cwd: dir,
    nodir: true,
    dot: true
  });
  
  // Filter out ignored files
  const validFiles = files.filter(file => !ig.ignores(file));
  
  let output = '';
  
  for (const file of validFiles) {
    const filePath = path.join(dir, file);
    
    try {
      // Try to read as text
      const content = fs.readFileSync(filePath, 'utf-8');
      
      output += `\n${'='.repeat(60)}\n`;
      output += `File: ${file}\n`;
      output += `${'='.repeat(60)}\n`;
      output += content;
      output += '\n';
    } catch {
      // Skip binary files
      continue;
    }
  }
  
  return output;
}

async function main() {
  try {
    const currentDir = process.cwd();
    console.log('Reading files from:', currentDir);
    
    const content = await getFilesContent(currentDir);
    
    if (!content) {
      console.log('No files found to copy.');
      return;
    }
    
    await clipboardy.write(content);
    
    const fileCount = content.match(/File: /g)?.length || 0;
    console.log(`✓ Copied ${fileCount} files to clipboard`);
    console.log(`Total size: ${(content.length / 1024).toFixed(2)} KB`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();