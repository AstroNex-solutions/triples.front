const fs = require('fs');
const oldContent = fs.readFileSync('h:/Astronex Solutions/test/frontend/src/pages/CoursePlayerPage.backup.jsx', 'utf8');

// We will extract the logic part and replace the UI part.
// Actually, it's better if I just write the new file completely in this script.
