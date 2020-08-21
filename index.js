const Discord = require('discord.js');
const bot = new Discord.Client();
const guilds = new Discord.Guild(bot,)
const { token, id, prefix, ownerID, permittedGuilds} = require("./config.json"); 

const py = require("python-shell");
let options = {  
    args: ['--top_k=40', '--temperature=1.0', '--model_name=117M'],  
    scriptPath: 'gpt-2/src',  
    mode: 'text',  
    pythonOptions: ['-u'],
};  

bot.on('ready', () => {
    console.log(`Logged in as ${bot.user.tag}!`); 
    console.log(`Now in ${bot.guilds.cache.size} guilds :D`);
});

bot.on('disconnect', () => {
    console.log('Disconnect!');
});

process.on('unhandledRejection', error => {
    console.error('UNHANDLED PROMISE REJECTION:\n', error);
});

bot.on("guildCreate", guild => {
    console.log(`Joined ${bot.guilds.cache.name}!`);
});

bot.on('message', async message => {
    var flag = true;
    // exit early if message is sent by a bot or if message doesn't start with "fn "
    if(message.author.bot || !message.content.startsWith(prefix)) return;

    var msg = message.content.substring(prefix.length)
    console.log(`\n\n${message.createdAt}\nMessage (${message.author.username}): ${msg}`);
    if(message.content.substring(prefix.length,prefix.length+2) === "-h")
        return message.channel.send("help message here")
    else {
        var pyshell = new py.PythonShell('interactive_conditional_samples.py', options);
        console.log("New pyshell created.")

        pyshell.send(msg, function (err) { 
            console.log("pyshell.send() in progress...")
            if (err) console.log("There was an error in pyshell.send");
            else console.log("Message sent to python; awaiting response...");
        });
        
        pyshell.stdout.on('data', function (data) {
            console.log("pyshell.stdout.on() in progress...")  
            if(flag){
                //console.log(`Flag is: ${flag}`)
                console.log("Response received from python: ")
                console.log(data);
                flag = false;
                //console.log(`Flag is: ${flag}`)
                if(data.substring(10).includes("<|endoftext|>")){
                    message.channel.send(data.substring(0,data.indexOf("<|endoftext|>")))
                    console.log(`Finished responding to ${message.author.username}.\n`);
                    return;
                } else {
                    message.channel.send(data.substring(0,2000));
                    console.log(`Finished responding to ${message.author.username}.\n`);
                    return;
                }
            } 
        }); 
          
        pyshell.stdout.end(function (err) {
            if (err){
                throw err;
            };
            console.log(`pyshell.stdout.end called!!`);
        });
    }
    return;
});

bot.login(token);