import json
import sys

def inject_translation(target_file, inject_file, root_key):
    try:
        with open(target_file, "r", encoding="utf-8") as f:
            target_data = json.load(f)
            
        with open(inject_file, "r", encoding="utf-8-sig") as f:
            inject_data = json.load(f)
            
        target_data[root_key] = inject_data
        
        with open(target_file, "w", encoding="utf-8") as f:
            json.dump(target_data, f, ensure_ascii=False, indent=2)
            
        print(f"Successfully injected {root_key} into {target_file}")
    except Exception as e:
        print(f"Error: {e}")

inject_translation("h:/Astronex Solutions/test/frontend/src/locales/ar/translation.json", "h:/Astronex Solutions/test/frontend/src/locales/adminCourseForm_ar.json", "adminCourseForm")
inject_translation("h:/Astronex Solutions/test/frontend/src/locales/en/translation.json", "h:/Astronex Solutions/test/frontend/src/locales/adminCourseForm_en.json", "adminCourseForm")
