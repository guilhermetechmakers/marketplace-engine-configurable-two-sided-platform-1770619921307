const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const viteDir = path.join(__dirname, '..', 'node_modules', 'vite');
const tarball = path.join(__dirname, '..', 'vite-5.4.21.tgz');
if (!fs.existsSync(viteDir)) {
  if (!fs.existsSync(tarball)) {
    execSync('npm pack vite@5.4.21', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
  }
  fs.mkdirSync(viteDir, { recursive: true });
  execSync(`tar -xzf "${tarball}" -C "${viteDir}" --strip-components=1`, { stdio: 'inherit' });
}
