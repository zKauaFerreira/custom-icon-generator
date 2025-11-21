import { promises as fs } from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path do package.json da branch autorun
const packagePath = path.resolve(__dirname, '../package.json');

/* =====================================================
   1. PEGAR VERSÃO MAIS RECENTE DO SIMPLE-ICONS
===================================================== */
async function getLatestVersion() {
    try {
        const response = await fetch('https://registry.npmjs.org/simple-icons/latest');
        const data = await response.json();
        return data.version;
    } catch (e) {
        console.error('Could not get latest version via API:', e);
        return null;
    }
}

/* =====================================================
   2. FUNÇÃO PARA FAZER COMMIT NO GITHUB (NA MAIN)
===================================================== */
async function commitToGitHub(updatedContent) {
    const token = process.env.PAT_TOKEN;
    const owner = process.env.REPO_OWNER;
    const repo = process.env.REPO_NAME;
    const branch = process.env.TARGET_BRANCH; // normalmente "main"

    if (!token || !owner || !repo || !branch) {
        console.error("Missing environment variables for GitHub commit");
        return;
    }

    const apiBase = `https://api.github.com/repos/${owner}/${repo}`;

    // 1. pega o último commit da main
    const refRes = await fetch(`${apiBase}/git/ref/heads/${branch}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const refData = await refRes.json();
    const latestCommitSha = refData.object.sha;

    // 2. pega commit para achar a tree
    const commitRes = await fetch(`${apiBase}/git/commits/${latestCommitSha}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const commitData = await commitRes.json();

    // 3. cria blob com novo package.json
    const blobRes = await fetch(`${apiBase}/git/blobs`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            content: updatedContent,
            encoding: 'utf-8'
        })
    });
    const blobData = await blobRes.json();

    // 4. nova tree
    const treeRes = await fetch(`${apiBase}/git/trees`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            base_tree: commitData.tree.sha,
            tree: [
                {
                    path: "package.json",
                    mode: "100644",
                    type: "blob",
                    sha: blobData.sha
                }
            ]
        })
    });
    const treeData = await treeRes.json();

    // 5. faz commit
    const newCommitRes = await fetch(`${apiBase}/git/commits`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: "chore: auto-update simple-icons version",
            parents: [latestCommitSha],
            tree: treeData.sha
        })
    });
    const newCommitData = await newCommitRes.json();

    // 6. atualiza ponteiro da branch main
    await fetch(`${apiBase}/git/refs/heads/${branch}`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            sha: newCommitData.sha
        })
    });

    console.log("✔ Commit enviado com sucesso na branch main!");
}

/* =====================================================
   3. LÓGICA PRINCIPAL
===================================================== */
async function main() {
    const raw = await fs.readFile(packagePath, 'utf8');
    const packageJson = JSON.parse(raw);

    const currentVersion = packageJson.dependencies['simple-icons'].replace(/[\^~]/g, '');
    const latestVersion = await getLatestVersion();

    if (!latestVersion) {
        console.log("Failed to get latest version. Abort.");
        return;
    }

    console.log("Current:", currentVersion, " | Latest:", latestVersion);

    if (currentVersion !== latestVersion) {
        console.log(`🚨 Nova versão detectada! Atualizando para ^${latestVersion}`);

        packageJson.dependencies['simple-icons'] = `^${latestVersion}`;
        const updatedContent = JSON.stringify(packageJson, null, 2) + "\n";

        // atualiza localmente na autorun
        await fs.writeFile(packagePath, updatedContent);

        // commit na main
        await commitToGitHub(updatedContent);

        process.exit(1);
    } else {
        console.log("Nenhuma atualização necessária.");
        process.exit(0);
    }
}

main();
