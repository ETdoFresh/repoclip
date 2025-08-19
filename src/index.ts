#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import ignore from 'ignore';
import clipboardy from 'clipboardy';
import { Command } from 'commander';
import { minimatch } from 'minimatch';

interface Options {
  ignore?: string[];
  only?: string[];
  stdout?: boolean;
}

async function getGitignorePatterns(dir: string): Promise<string[]> {
  const gitignorePath = path.join(dir, '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    return [];
  }
  
  const content = fs.readFileSync(gitignorePath, 'utf-8');
  return content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
}

async function getFilesContent(dir: string, options: Options): Promise<string> {
  const patterns = await getGitignorePatterns(dir);
  const ig = ignore().add(patterns);
  
  // Always ignore .git directory and node_modules
  ig.add(['.git', 'node_modules']);
  
  // Add additional ignore patterns from CLI
  if (options.ignore && options.ignore.length > 0) {
    ig.add(options.ignore);
  }
  
  // Get all files
  const files = await glob('**/*', {
    cwd: dir,
    nodir: true,
    dot: true
  });
  
  // Filter out ignored files
  let validFiles = files.filter(file => !ig.ignores(file));
  
  // Apply --only filters if provided
  if (options.only && options.only.length > 0) {
    validFiles = validFiles.filter(file => 
      options.only!.some(pattern => minimatch(file, pattern))
    );
  }
  
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
  const program = new Command();
  
  program
    .name('repoclip')
    .description('Copy all non-gitignored files to clipboard')
    .version('1.0.0')
    .option('-i, --ignore <patterns...>', 'additional patterns to ignore')
    .option('-o, --only <patterns...>', 'only include files matching these patterns')
    .option('-s, --stdout', 'output to stdout instead of clipboard')
    .helpOption('-h, --help', 'display help for command')
    .addHelpText('after', `
Examples:
  $ repoclip                           # Copy all non-gitignored files
  $ repoclip --ignore "**/*.log"       # Ignore all .log files
  $ repoclip --only "*.ts" "*.js"      # Only include .ts and .js files
  $ repoclip -i "tmp/*" -o "src/**"    # Ignore tmp/ and only include src/
  $ repoclip --stdout                  # Display files instead of copying
  $ repoclip -s -o "*.json"            # Display only JSON files
    `);
  
  program.parse();
  const options = program.opts<Options>();
  
  try {
    const currentDir = process.cwd();
    console.log('Reading files from:', currentDir);
    
    if (options.ignore) {
      console.log('Additional ignores:', options.ignore.join(', '));
    }
    
    if (options.only) {
      console.log('Only including:', options.only.join(', '));
    }
    
    const content = await getFilesContent(currentDir, options);
    
    if (!content) {
      console.log('No files found to copy.');
      return;
    }
    
    const fileCount = content.match(/File: /g)?.length || 0;
    
    if (options.stdout) {
      // Output to console
      console.log(content);
      console.error(`\n--- ${fileCount} files, ${(content.length / 1024).toFixed(2)} KB ---`);
    } else {
      // Try to copy to clipboard
      try {
        await clipboardy.write(content);
        console.log(`✓ Copied ${fileCount} files to clipboard`);
        console.log(`Total size: ${(content.length / 1024).toFixed(2)} KB`);
      } catch (clipboardError) {
        // Fallback to stdout if clipboard fails
        console.error('Warning: Clipboard access failed. Outputting to stdout instead.');
        console.error('Use --stdout flag to avoid this warning.\n');
        console.log(content);
        console.error(`\n--- ${fileCount} files, ${(content.length / 1024).toFixed(2)} KB ---`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();