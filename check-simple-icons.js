import { promises as fs } from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* =====================================================
   PATHS DAS DUAS BRANCHES
===================================================== */

// package.json da autorun (onde o script roda)
const autorunPackagePath = path.resolve(__dirname, "./package.json");

// package.json da MAIN (checkout feito em ./main)
const mainPackagePath = path.resolve(__dirname, "../main/package.json");

/* =====================================================
   1. PEGAR VERSÃO MAIS RECENTE DO SIMPLE-ICONS
===================================================== */
async function getLatestVersion() {
    try {
        const response = await fetch("https://registry.npmjs.org/simple-icons/latest");
        const data = await response.json();
        return data.version;
    } catch (e) {
        console.error("Could not get latest version via API:", e);
        return null;
    }
}

/* =====================================================
   2. FAZER O COMMIT NA MAIN
===================================================== */
async function commitToGitHub(updatedContentMain) {
    const token = process.env.PAT_TOKEN;
    const owner = process.env.REPO_OWNER;
    const repo = process.env.REPO_NAME;
    const branch = process.env.TARGET_BRANCH;

    if (!token || !owner || !repo || !branch) {
        console.error("❌ Missing environment variables for GitHub commit");
        return;
    }

    const apiBase = `https://api.github.com/repos/${owner}/${repo}`;

    // pegar último commit da main
    const refRes = await fetch(`${apiBase}/git/ref/heads/${branch}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const refData = await refRes.json();
    const latestCommitSha = refData.object.sha;

    // pegar commit para extrair a tree
    const commitRes = await fetch(`${apiBase}/git/commits/${latestCommitSha}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const commitData = await commitRes.json();

    // criar blob com novo package.json
    const blobRes = await fetch(`${apiBase}/git/blobs`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            content: updatedContentMain,
            encoding: "utf-8"
        })
    });
    const blobData = await blobRes.json();

    // criar nova tree
    const treeRes = await fetch(`${apiBase}/git/trees`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
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

    // criar commit
    const newCommitRes = await fetch(`${apiBase}/git/commits`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            message: "chore: auto-update simple-icons version",
            parents: [latestCommitSha],
            tree: treeData.sha
        })
    });
    const newCommitData = await newCommitRes.json();

    // atualizar ponteiro da branch main
    await fetch(`${apiBase}/git/refs/heads/${branch}`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
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
    // ler ambos package.json
    const autorunRaw = await fs.readFile(autorunPackagePath, "utf8");
    const mainRaw = await fs.readFile(mainPackagePath, "utf8");

    const autorunPackage = JSON.parse(autorunRaw);
    const mainPackage = JSON.parse(mainRaw);

    // versão que está NO SITE (main)
    const currentVersion = (mainPackage.dependencies["simple-icons"] || "").replace(/[\^~]/g, "");

    // versão mais recente no npm
    const latestVersion = await getLatestVersion();
    if (!latestVersion) {
        console.log("❌ Failed to get latest version. Abort.");
        return;
    }

    console.log("Current:", currentVersion, "| Latest:", latestVersion);

    // comparação
    if (currentVersion !== latestVersion) {
        console.log(`🚨 Nova versão detectada! Atualizando para ^${latestVersion}`);

        // atualizar na main
        mainPackage.dependencies["simple-icons"] = `^${latestVersion}`;
        const updatedMainContent = JSON.stringify(mainPackage, null, 2) + "\n";

        // atualizar localmente na autorun (opcional)
        autorunPackage.dependencies["simple-icons"] = `^${latestVersion}`;
        const updatedAutorunContent = JSON.stringify(autorunPackage, null, 2) + "\n";

        await fs.writeFile(mainPackagePath, updatedMainContent);
        await fs.writeFile(autorunPackagePath, updatedAutorunContent);

        // commit na main
        await commitToGitHub(updatedMainContent);

        process.exit(1);
    } else {
        console.log("Nenhuma atualização necessária.");
        process.exit(0);
    }
}

main();
