import { Octokit } from "@octokit/rest";
import OpenAI from "openai";

// Inicializa os clientes usando as chaves de ambiente
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
const pull_number = parseInt(process.env.PR_NUMBER, 10);

async function runReview() {
  try {
    // 1. Obtém o diff das alterações do Pull Request
    const { data: diff } = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number,
      mediaType: { format: "diff" },
    });

    if (!diff || diff.length === 0) {
      console.log("Nenhuma alteração detectada no diff.");
      return;
    }

    // Limita o tamanho do diff enviado para evitar estouro de tokens
    const truncatedDiff = diff.slice(0, 10000);

    // 2. Envia o diff para a OpenAI analisar
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Você é um revisor de código especialista. Analise o diff a seguir e forneça um feedback construtivo em Português. Aponte potenciais bugs, problemas de segurança, performance ou boas práticas. Seja direto e objetivo.",
        },
        {
          role: "user",
          content: `Analise o seguinte diff de código:\n\n${truncatedDiff}`,
        },
      ],
    });

    const reviewFeedback = response.choices[0].message.content;

    // 3. Publica a análise como um comentário no Pull Request
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: pull_number,
      body: `## 🤖 Revisão Automática (OpenAI)\n\n${reviewFeedback}`,
    });

    console.log("Revisão enviada com sucesso!");
  } catch (error) {
    console.error("Erro ao executar a integração:", error);
    process.exit(1);
  }
}

runReview();
