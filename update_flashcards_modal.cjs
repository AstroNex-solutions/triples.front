const fs = require('fs');

const managerContent = fs.readFileSync('src/pages/adminComponents/ui/FlashcardsManager.jsx', 'utf8');

let newContent = managerContent
  // Change component name and props
  .replace('FlashcardsManager({ product, onClose, showMsg })', 'ModuleFlashcardsModal({ show, onClose, module, course, showMsg })')
  // Add show check
  .replace('const { t, i18n } = useTranslation();', 'const { t, i18n } = useTranslation();\n  if (!show) return null;')
  // Replace product references with module
  .replace(/product\.id/g, 'module?.id')
  .replace(/product\.title/g, 'module?.name')
  // Update APIs
  .replace(/\/admin\/flashcard-products\/\$\{product\.id\}\/decks/g, '/admin/modules/${module?.id}/flashcards')
  .replace(/\/admin\/flashcard-products\/\$\{product\.id\}\/upload/g, '/admin/modules/${module?.id}/flashcards/upload');

fs.writeFileSync('src/pages/adminComponents/sections/courses/ModuleFlashcardsModal.jsx', newContent);
console.log('Successfully updated ModuleFlashcardsModal.jsx');
