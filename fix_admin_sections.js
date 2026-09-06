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
    // We match `export default function ComponentName({ showMsg }) {` or `export default function ComponentName(props) {` if it has `{ showMsg }` inside.
    // The safest regex:
    const regex = /export\s+default\s+function\s+([A-Za-z0-9_]+)\s*\(\s*\{\s*showMsg\s*\}\s*\)\s*\{/;
    if (regex.test(content)) {
      content = content.replace(regex, 'export default function $1() {\n  const { showMsg } = useOutletContext();');
      modified = true;
    } else {
        // Try other variations like ({ showMsg, otherProp })
        // It's easier if we know they all look like ({ showMsg })
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${file}`);
    }
  }
});
