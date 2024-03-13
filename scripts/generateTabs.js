const fs = require('fs');
const path = require('path');

const tabsDir = path.join(__dirname, '..', 'src', 'tabs');
const outputFilePath = path.join(__dirname, '..', 'src', 'tabs', 'index.ts');

fs.readdir(tabsDir, (err, files) => {
  if (err) {
    console.error('Error listing tabs directory:', err);
    return;
  }

  const importStatements = files
    .filter((file) => file.endsWith('.tsx'))
    .map((file) => {
      const componentName = path.basename(file, path.extname(file));
      return `import ${componentName} from './${file.replace('.tsx', '')}';`;
    })
    .join('\n');

  const exportStatement = `export { ${files
    .filter((file) => file.endsWith('.tsx'))
    .map((file) => path.basename(file, '.tsx'))
    .join(', ')} };`;

  const content = `${importStatements}\n\n${exportStatement}\n`;

  fs.writeFile(outputFilePath, content, (err) => {
    if (err) {
      console.error('Error writing tabs index file:', err);
      return;
    }

    console.log('Tabs index file generated successfully.');
  });
});
