const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'CourseDetailPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  /يتضمن \{course\.modules\?\.length \|\| 0\} موديولات • \{totalLessons\} درس فيديو/g,
  "{t('courseDetails.curriculumStats', 'يتضمن {{modulesCount}} موديولات • {{lessonsCount}} درس فيديو', { modulesCount: course.modules?.length || 0, lessonsCount: totalLessons })}"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed dynamic strings.');
