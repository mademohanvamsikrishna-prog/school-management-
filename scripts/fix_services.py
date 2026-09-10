import pathlib
import re

services_dir = pathlib.Path('src/services')
new_services = ['foodcourt.ts', 'transport.ts', 'library.ts', 'leave.ts', 'chat.ts', 'admin.ts']

for fname in new_services:
    f = services_dir / fname
    if not f.exists():
        print(f'MISSING: {fname}')
        continue
    content = f.read_text(encoding='utf-8')

    # Replace import
    content = content.replace("import { apiRequest } from './api';", "import { api } from './api';")

    # POST with body: apiRequest('/path', { method: 'POST', body: JSON.stringify(data) })
    content = re.sub(
        r"apiRequest\((['\"`][^'\"`,]+['\"`]), \{ method: 'POST', body: JSON\.stringify\((\w+)\) \}\)",
        r'api.post(\1, \2)',
        content
    )
    # POST without body
    content = re.sub(
        r"apiRequest\((['\"`][^'\"`,]+['\"`]), \{ method: 'POST' \}\)",
        r'api.post(\1)',
        content
    )
    # DELETE
    content = re.sub(
        r"apiRequest\((['\"`][^'\"`,]+['\"`]), \{ method: 'DELETE' \}\)",
        r'api.delete(\1)',
        content
    )
    # PATCH with body
    content = re.sub(
        r"apiRequest\((['\"`][^'\"`,]+['\"`]), \{ method: 'PATCH', body: JSON\.stringify\((\w+)\) \}\)",
        r'api.patch(\1, \2)',
        content
    )
    # Bare GET - backtick template strings
    content = re.sub(
        r"apiRequest\((`[^`]+`)\)",
        r'api.get(\1)',
        content
    )
    # Bare GET - single/double quoted strings
    content = re.sub(
        r"apiRequest\(('[^']+'\))",
        r'api.get(\1',
        content
    )
    content = re.sub(
        r"apiRequest\(\"([^\"]+)\"\)",
        r'api.get("\1")',
        content
    )

    f.write_text(content, encoding='utf-8')
    print(f'Updated: {fname}')
