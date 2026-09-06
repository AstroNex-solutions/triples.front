const fs = require('fs');
const path = require('path');

const dir = 'src/pages/adminComponents/sections';

fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('.jsx')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    let modified = false;

    // 1. Add useOutletContext import if missing
    if (!content.includes('useOutletContext')) {
      content = `import { useOutletContext } from 'react-router-dom';\n` + content;
      modified = true;
    }

    // 2. Remove { showMsg } from props
    const regex1 = /export\s+default\s+function\s+([A-Za-z0-9_]+)\s*\(\s*\{\s*showMsg\s*\}\s*\)\s*\{/;
    const regex2 = /const\s+([A-Za-z0-9_]+)\s*=\s*\(\s*\{\s*showMsg\s*\}\s*\)\s*=>\s*\{/;
    
    if (regex1.test(content)) {
      content = content.replace(regex1, 'export default function $1() {\n  const { showMsg } = useOutletContext();');
      modified = true;
    } else if (regex2.test(content)) {
      content = content.replace(regex2, 'const $1 = () => {\n  const { showMsg } = useOutletContext();');
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${file}`);
    }
  }
});
