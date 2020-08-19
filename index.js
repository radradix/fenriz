const Discord = require('discord.js');
const bot = new Discord.Client();
const guilds = new Discord.Guild(bot,)
const { token, id, prefix, ownerID, permittedGuilds} = require("./config.json"); 
const py = require("python-shell");
const webhook = new Discord.WebhookClient(id, token)

bot.on('ready', () => {
    function launchPython() {  
        return new Promise(fulfill => {  
            let options = {  
                args: ['--top-k 40', '--temperature 0.8', '--model_name general'],  
                scriptPath: 'gpt-2/src',  
                mode: 'text',  
                pythonOptions: ['-u']  
            };  
            let pyshell = new py.PythonShell('interactive_conditional_samples.py', options);  
            pyshell.on('message', function (message) {  
                console.log("Python >>> " + message);  
                if (message.includes("$:ready")) {  
                    console.log("Model prompted normally!");  
                    fulfill(pyshell);  
                }  
                if (message.includes("$:prompt:")) {  
                    handlePythonResponse(message);  
                }  
            });  
            pyshell.on('stderr', function (error) {  
                console.log(error);  
            });  
       });  
    }
    launchPython();
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
    var pythonRequests = [];
    var activePythonRequest = false;
    let options = {  
        args: ['--top-k 40', '--temperature 0.8', '--model_name general'],  
        scriptPath: 'gpt-2/src',  
        mode: 'text',  
        pythonOptions: ['-u']  
    };  
    let pyshell = new py.PythonShell('interactive_conditional_samples.py', options);  

    function sendPythonRequest(input, channel = null, message = null) {  
        let newRequest = {input: input, channel: channel, message: message};  
        let id = pythonRequests.length;  
        pythonRequests.push(newRequest);  
        if (!activePythonRequest) {  
            try {  
                activePythonRequest = true;  
                pyshell.send(id + "$:input:" + input);  
            } catch (e) {  
                activePythonRequest = false;  
                console.log(e);  
            } 
        } 
    }

    function handlePythonResponse(message) {  
        activePythonRequest = false;  
        // let id = message.split("$:prompt:")[0];  
        let result = message.split("$:prompt:")[1];  
        let request = pythonRequests[id];  
        let decoded = decodeChannel(result);  
        sendHooks(request.channel, decoded);  
        /*if (id < (pythonRequests.length - 1)) {  
            let newID = parseInt(id) + 1;  
            let request = pythonRequests[newID];  */
            try {  
                shell.send(newID + "$:input:" + request.input);  
                activePythonRequest = true;  
            } catch (e) {  
                console.log("Couldn't process next request: " + e);  
            }  
        //}  
    }

    function decodeChannel(data) {  
        let decoded = [];  
        let entries = data.split("<|endoftext|>");  
        for (let entry of entries) {  
            try {  
                entry = entry.trim();  
                let points = entry.split("$:");  
                console.log(points);  
                let header = points[1].trim();  
                let content = points[2].trim();  
                if (/^START \d+ \d+$/.test(header)) {  
                    let user = header.split(" ")[2];  
                    decoded.push({author: user, content: content});  
                }  
            } catch (e) {  
            }  
        }  
        return decoded;  
    }

    
    function sendHooks(channelID, messages) {  
        let channel = bot.channels.get(channelID);   
        let delay = 0;  
        let hook = webhook;  
        for (let message of messages) {  
            let text = message.content;  
            let userID = message.author;  
            let name = "Unknown User";  
            let avatar = "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png";   
            try {  
                name = channel.guild.members.get(userID).displayName;  
                avatar = bot.users.get(userID).displayAvatarURL;  
            } catch (e) {  
            }  
        }  
        setTimeout(() => {  
            hook.send(text, {username: name, avatarURL: avatar})
                .catch(err => {  
                    console.log("Couldn't send: " + message.content);  
                    console.log(err);  
                });  
        }, delay);  
        delay += 1; 
        }   
    
    
    // exit early if message is sent by a bot or if message doesn't start with "fn "
    if(message.author.bot || !message.content.startsWith(prefix)) return;
    
    let msg = message.content.substring(prefix.length); 
    console.log("\n\nMessage (" + message.author.username + "): " + msg);
    if(message.content.substring(0,2) === "-h")
        return message.channel.send("help message here")
    else{
        console.log("Sending python request...");
        sendPythonRequest(msg.replace(/\$:/g, ":") + " $: END " + message.author.id + " <|endoftext|>", message.channel.id, msg);
    }
    handlePythonResponse(msg);
    

});

bot.login(token);