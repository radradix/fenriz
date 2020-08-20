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
    flag: 'True'
};  
var pyshell = new py.PythonShell('interactive_conditional_samples.py', options);  

bot.on('ready', () => {
    console.log(`Logged in as ${bot.user.tag}!`); 
    console.log("Now in " + bot.guilds.cache.size + " guilds :D");
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
    // exit early if message is sent by a bot or if message doesn't start with "fn "
    if(message.author.bot || !message.content.startsWith(prefix)) return;

    console.log(`\n\n${message.createdAt}\nMessage (${message.author.username}): ${message.content}`);
    if(message.content.substring(prefix.length,prefix.length+2) === "-h")
        return message.channel.send("help message here")
    else{
        //static run(scriptPath: string, options?: Options, callback?: (err?: PythonShellError, output?: any[]) => any): PythonShell;
        pyshell = new py.PythonShell('interactive_conditional_samples.py', options);  
        pyshell.send(message.content, function (err) { 
            console.log("pyshell.send in progress...")
            if (err) console.log("There was an error in pyshell.send");
            else{
                console.log("Message sent to python; awaiting response...");
            } 
        });
        var flag = true;
        if(flag){
            console.log("flag is true")
            pyshell.stdout.on('data', function (data) {  
                console.log("Response received from python: ")
                console.log(data);
                if(data.includes("<|endoftext|>")){
                    message.channel.send(data.substring(0,data.indexOf("<|endoftext|>")))
                } else {
                    message.channel.send(data.substring(0,2000));
                }
                flag = false;
            }); 
            
            pyshell.on('stderr', function (error) {  
                console.log("error: " + error);  
            });   
    
            pyshell.end(function (err) {
                if (err){
                    throw err;
                };
                console.log('Finished responding to ' + message.author.username + ".\n");
                pyshell.terminate();
                return;
            });
        } // end if flag
    }
    console.log("END OF LOOP.")
    return;
});

bot.login(token);