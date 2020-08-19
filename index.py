import discord
import json
import logging
import inspect
from discord.ext import commands
from gptchatbot import GPT2Bot

logging.basicConfig(level=logging.INFO)

with open('auth.json') as data_file:
    auth = json.load(data_file)

bot = commands.Bot(command_prefix=commands.when_mentioned_or('!'), description='GPT-2', max_messages=5000)
# gptCog = GPT2Bot(bot)
# bot.add_cog(gptCog)   
initial_extensions = ['gptchatbot']

if __name__ == '__main__':
    for extension in initial_extensions:
        try:
            bot.load_extension(extension)
        except Exception as e:
            logging.error(f'Failed to load extension {extension}. Error: {e}')


@bot.event
async def on_ready():
    await bot.change_presence(activity=discord.Game(name='Talking with people', type=0, url='https://github.com/itsmehemant123/gpt2-discord-bot'))
    logging.info('Logged in as:{0} (ID: {0.id})'.format(bot.user))

async def on():
    s = set(permittedGuilds)
    if message.guild.id in permittedGuilds:
        input = message.content
        id = message.id
        sendPythonRequest(input, message.channel.id, message); 



bot.run(auth['token'])