import { Telegraf, session } from 'telegraf';
import { message } from 'telegraf/filters';
import { code } from 'telegraf/format';
import config from 'config';
import { ogg } from './ogg.js';
import { openai } from './openai.js';
import { removeFile } from './utils.js'
import { initCommand, processTextToChat, INITIAL_SESSION } from './logic.js'

const bot = new Telegraf(config.get('TELEGRAM_TOKEN'));

bot.use(session());

bot.command('new', initCommand)

bot.command('start', initCommand)

bot.on(message('voice'), async (ctx) => {
    ctx.session ??= INITIAL_SESSION;
    try {
        await ctx.reply(code('Повідомлення прийнято, очикується відповідь від серверу...'))
        const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
        const userId = String(ctx.message.from.id);
        const oggPath = await ogg.create(link.href, userId);
        const mp3Path = await ogg.toMp3(oggPath, userId);

        removeFile(oggPath);

        const text = await openai.trascription(mp3Path);

        removeFile(mp3Path);

        await ctx.reply(code(`Ваш запит: ${text}`));

        await processTextToChat(ctx, text);

    } catch (e) {
        console.error(`Error while voice message`, e.message);
    }
});

bot.on(message('text'), async (ctx) => {
    ctx.session ??= INITIAL_SESSION;
    try {
        await ctx.reply(code('Повідомлення прийнято, очикується відповідь від серверу...'));
        await processTextToChat(ctx, ctx.message.text);
    } catch (e) {
        console.error(`Error while voice message`, e.message);
    }
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));


