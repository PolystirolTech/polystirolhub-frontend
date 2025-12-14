import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generatedDir = path.join(__dirname, '..', 'src', 'lib', 'api', 'generated');

function addTsNoCheck(dir) {
	const files = fs.readdirSync(dir, { withFileTypes: true });

	for (const file of files) {
		const fullPath = path.join(dir, file.name);

		if (file.isDirectory()) {
			addTsNoCheck(fullPath);
		} else if (file.name.endsWith('.ts')) {
			const content = fs.readFileSync(fullPath, 'utf8');

			// Проверяем, есть ли уже @ts-nocheck
			if (!content.includes('@ts-nocheck')) {
				// Добавляем в самое начало файла
				const newContent = '// @ts-nocheck\n' + content;
				fs.writeFileSync(fullPath, newContent, 'utf8');
				console.log(`Added @ts-nocheck to ${fullPath}`);
			}
		}
	}
}

addTsNoCheck(generatedDir);
console.log('Done!');
