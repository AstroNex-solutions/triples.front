const fs = require('fs');
const path = require('path');

const arPath = path.join(__dirname, 'ar', 'translation.json');
const enPath = path.join(__dirname, 'en', 'translation.json');

const arData = JSON.parse(fs.readFileSync(arPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

if (!arData.admin.sections.charts) {
  arData.admin.sections.charts = {
    revenueOverview: "نظرة عامة على الإيرادات",
    newEnrollments: "الاشتراكات الجديدة",
    coursesByCategory: "الكورسات حسب الأقسام"
  };
}

if (!enData.admin.sections.charts) {
  enData.admin.sections.charts = {
    revenueOverview: "Revenue Overview",
    newEnrollments: "New Enrollments",
    coursesByCategory: "Courses by Category"
  };
}

fs.writeFileSync(arPath, JSON.stringify(arData, null, 2));
fs.writeFileSync(enPath, JSON.stringify(enData, null, 2));
console.log('Translations updated.');
