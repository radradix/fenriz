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
//var pyshell = new py.PythonShell('interactive_conditional_samples.py', options);

var PythonShell = require('python-shell');
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
    var flag = true;

    // exit early if message is sent by a bot or if message doesn't start with "fn "
    if(message.author.bot || !message.content.startsWith(prefix)) return;

    var msg = message.content.substring(prefix.length)
    console.log(`\n\n${message.createdAt}\nMessage (${message.author.username}): ${msg}`);
    if(message.content.substring(prefix.length,prefix.length+2) === "-h")
        return message.channel.send("help message here")
    else {
        // execute python script with arguments 
        py.PythonShell.run('interactive_conditional_samples.py', options, function (err, results) {
            console.log("py.PythonShell.run() in progress...")
            if (err){
                throw err;
            }
            console.log('Results: ' + results);
        })


        pyshell.send(msg, function (err) { 
            console.log("pyshell.send() in progress...")
            if (err) console.log("There was an error in pyshell.send");
            else console.log("Message sent to python; awaiting response...");
        });


        pyshell.stdout.on('data', function (data) {
            console.log("pyshell.stdout.on() in progress...")  
            //if(flag){
                console.log("Flag is: " + flag)
                console.log("Response received from python: ")
                console.log(data);
                flag = false;
                console.log("flag is false")
                if(data.substring(10).includes("<|endoftext|>")){
                    message.channel.send(data.substring(0,data.indexOf("<|endoftext|>")))
                    return;
                } else {
                    message.channel.send(data.substring(0,2000));
                    return;
                }
            //} else return; // if flag is false, then just return
        }); 
        

        /*pyshell.on('stderr', function (error) {  
            console.log("error: " + error);  
        });   */


        pyshell.end(function (err) {
            if (err){
                throw err;
            };
            console.log('Finished responding to ' + message.author.username + ".\n");
        });
    }
    return;
});

bot.login(token);