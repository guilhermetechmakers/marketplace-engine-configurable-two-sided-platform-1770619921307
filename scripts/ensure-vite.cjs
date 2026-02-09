const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const projectRoot = path.join(__dirname, '..');
const viteDir = path.join(projectRoot, 'node_modules', 'vite');
const rollupDir = path.join(projectRoot, 'node_modules', 'rollup');

// When NODE_ENV=production, npm skips devDependencies. Vite needs rollup; ensure both are present.
if (!fs.existsSync(viteDir) || !fs.existsSync(rollupDir)) {
  const env = { ...process.env, NODE_ENV: 'development' };
  execSync('npm install --include=dev --ignore-scripts', { cwd: projectRoot, stdio: 'inherit', env });
}
