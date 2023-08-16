import { openai } from './openai.js'
import { textConverter } from './texttospeach.js'

export const INITIAL_SESSION = {
    messages: [],
}

export async function initCommand(ctx) {
    ctx.session = { ...INITIAL_SESSION }
    await ctx.reply('Чекаю ваше голосове або текстове повідомлення')
}

export async function processTextToChat(ctx, content) {
    try {
        ctx.session.messages.push({ role: openai.roles.USER, content })

        const response = await openai.chat(ctx.session.messages)

        ctx.session.messages.push({
            role: openai.roles.ASSISTANT,
            content: response.content,
        })

        const source = await textConverter.textToSpeech(response.content)

        await ctx.sendAudio(
            { source },
            { title: 'Відповідь від асистента', performer: 'ChatGPT' }
        )

        await ctx.reply(response.content);

        // await ctx.reply(response.content)
    } catch (e) {
        console.log('Error while proccesing text to gpt', e.message)
    }
}