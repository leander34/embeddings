import 'dotenv/config'

import { ChatOpenAI } from 'langchain/chat_models/openai'
import { PromptTemplate } from 'langchain/prompts'
import { RetrievalQAChain } from 'langchain/chains'
import { redis, redisVectorStore } from './redis-store'
const openAiChat = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: 'gpt-3.5-turbo',
    temperature: 0.3
})

const prompt = new PromptTemplate({
    template: `
    Você responde perguntas variadas.
    O usuário está lendo um blog que abrange varios conteúdos.
    Use o conteúdo das transcrições abaixo para responder a pergunta do usuário.
    Se a responta não for encontrada nas transcrições, responda que você não sabe, não tente inventar uma resposta.


    Transcrições:
    {context}

    Pergunta:
    {question}
    `.trim(),
    inputVariables: ['context', 'question']
})

// Large Language Model
const chain = RetrievalQAChain.fromLLM(openAiChat, redisVectorStore.asRetriever(2), {
    prompt,
    returnSourceDocuments: true,
    verbose: true
})

async function main() {
    await redis.connect()

    const response = await chain.call({
        query: 'Quais são os benefícios dos bancos de dados de vetores?'
    })

    console.log(response)
    await redis.disconnect()
}

main()