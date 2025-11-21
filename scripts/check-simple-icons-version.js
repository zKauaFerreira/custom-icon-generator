const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Caminho para o package.json
const packagePath = path.resolve(__dirname, '../package.json');
const packageJson = require(packagePath);
const currentVersion = packageJson.dependencies['simple-icons'].replace(/[\^~]/g, '');

async function getLatestVersion() {
    try {
        // Usando a API do npm para obter metadados, que é mais confiável que scraping
        const response = await fetch('https://registry.npmjs.org/simple-icons/latest');
        if (!response.ok) {
            throw new Error(`Failed to fetch npm registry: ${response.statusText}`);
        }
        const data = await response.json();
        return data.version;
    } catch (error) {
        console.error('Error fetching latest version:', error.message);
        // Fallback para scraping se a API falhar (embora a API seja preferível)
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
    console.log(`Current installed version: ${currentVersion}`);
    const latestVersion = await getLatestVersion();

    if (!latestVersion) {
        console.log('Could not determine the latest version. Exiting.');
        return;
    }

    console.log(`Latest available version: ${latestVersion}`);

    if (latestVersion !== currentVersion) {
        console.log(`\n🚨 New version available! Updating package.json to ${latestVersion}`);
        
        // Atualiza o package.json
        packageJson.dependencies['simple-icons'] = `^${latestVersion}`;
        
        // Escreve o arquivo de volta
        fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
        
        console.log('package.json updated successfully.');
        
        // Em um ambiente de CI/CD, o próximo passo seria fazer o commit e push
        // Exemplo de comando que você rodaria no seu GitHub Action:
        // exec('git config user.name "GitHub Actions Bot"');
        // exec('git config user.email "actions@github.com"');
        // exec('git add package.json');
        // exec('git commit -m "chore: Update simple-icons to v${latestVersion}"');
        // exec('git push');
        
        // Retorna um código de saída que pode ser usado pelo CI/CD
        process.exit(1); // Indica que houve uma mudança e um rebuild é necessário
    } else {
        console.log('simple-icons is already up to date.');
        process.exit(0); // Indica sucesso e nenhuma mudança
    }
}

main();