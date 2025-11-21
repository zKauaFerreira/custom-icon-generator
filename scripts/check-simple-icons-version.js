import { promises as fs } from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';

// Define __dirname para compatibilidade com ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho para o package.json
const packagePath = path.resolve(__dirname, '../package.json');

async function getLatestVersion() {
    try {
        // Usando a API do npm para obter metadados
        const response = await fetch('https://registry.npmjs.org/simple-icons/latest');
        if (!response.ok) {
            throw new Error(`Failed to fetch npm registry: ${response.statusText}`);
        }
        const data = await response.json();
        return data.version;
    } catch (error) {
        console.error('Error fetching latest version from npm registry:', error.message);
        // Fallback para scraping (mantido, mas a API é preferível)
        try {
            const htmlResponse = await fetch('https://www.npmjs.com/package/simple-icons');
            const html = await htmlResponse.text();
            const match = html.match(/<span class="_76473bea f6 dib ph0 pv2 mb2-ns black-80 nowrap f5 fw4 lh-copy">([\d.]+)<!-- -->/);
            if (match && match[1]) {
                return match[1];
            }
        } catch (e) {
            console.error('Scraping fallback failed:', e.message);
        }
        return null;
    }
}

async function main() {
    // 1. Ler package.json
    const packageJsonContent = await fs.readFile(packagePath, 'utf-8');
    const packageJson = JSON.parse(packageJsonContent);
    
    const currentVersion = packageJson.dependencies['simple-icons'].replace(/[\^~]/g, '');

    console.log(`Current installed version: ${currentVersion}`);
    const latestVersion = await getLatestVersion();

    if (!latestVersion) {
        console.log('Could not determine the latest version. Exiting.');
        process.exit(0);
    }

    console.log(`Latest available version: ${latestVersion}`);

    if (latestVersion !== currentVersion) {
        console.log(`\n🚨 New version available! Updating package.json to ^${latestVersion}`);
        
        // 2. Atualiza o package.json
        packageJson.dependencies['simple-icons'] = `^${latestVersion}`;
        
        // 3. Escreve o arquivo de volta
        await fs.writeFile(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
        
        console.log('package.json updated successfully. Triggering rebuild.');
        
        // Indica que houve uma mudança e um rebuild é necessário
        process.exit(1); 
    } else {
        console.log('simple-icons is already up to date.');
        process.exit(0);
    }
}

main().catch(err => {
    console.error("An error occurred during execution:", err);
    process.exit(1);
});