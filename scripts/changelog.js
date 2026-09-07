import { execSync } from "child_process";
import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateChangelog() {
  try {
    // 1. Pega as últimas mensagens de commit git
    const gitLog = execSync("git log -n 10 --pretty=format:'- %s (%h)'").toString().trim();

    if (!gitLog) {
      console.log("Nenhum commit recente encontrado.");
      return;
    }

    // 2. Solicita à OpenAI para resumir as alterações em formato Markdown
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Você é um assistente técnico. Analise os últimos commits de um repositório e crie uma atualização de Release Notes em Português. Organize por seções como '🚀 Novas Funcionalidades', '🐛 Correções de Bugs' e '🔧 Melhorias'. Seja resumido e direto."
        },
        {
          role: "user",
          content: `Aqui estão os últimos commits:\n\n${gitLog}`
        }
      ]
    });

    const newContent = response.choices[0].message.content;
    const date = new Date().toISOString().split('T')[0];
    const changelogEntry = `\n\n## Versão - ${date}\n\n${newContent}\n`;

    // 3. Atualiza ou cria o arquivo CHANGELOG.md no topo
    let existingContent = "";
    if (fs.existsSync("CHANGELOG.md")) {
      existingContent = fs.readFileSync("CHANGELOG.md", "utf8");
    } else {
      existingContent = "# Histórico de Alterações (Changelog)\n";
    }

    fs.writeFileSync("CHANGELOG.md", existingContent + changelogEntry);
    console.log("CHANGELOG.md atualizado com sucesso!");

  } catch (error) {
    console.error("Erro ao gerar o Changelog:", error);
    process.exit(1);
  }
}

generateChangelog();
