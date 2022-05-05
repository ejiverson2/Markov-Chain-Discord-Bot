const MarkovModel = require("./MarkovModel.js")
const Discord = require("Discord.js");
const { token } = require("./config.json");
const fs = require("fs");
const yargs = require("yargs")

//Alert console the bot is booting up
console.log("Yume is preparing, please wait warmly...")

//Parse Arguments
const argv = yargs
    .option("isListening", {
        description: "If the bot records lines into the model and into memory",
        alias: 'l',
        type: 'boolean',
        default: false
    })
    .option("readMemory", {
        description: "What memory file to store sentences if listening",
        alias: 'r',
        type: "string",
        demandOption: true
    })
    .option("writeMemory", {
        description: "What memory file to store sentences if listening",
        alias: 'w',
        type: "string",
    })
    .help()
    .argv

if (argv.isListening == true) {
    if (!argv.w) {
        throw new Error("You need to specify a memory file to append to.")
    }
}

//### INITIALIZE THE BOT ###
// Create the bot and log in
const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS] })
client.login(token);

// Initialize the model and populate if from memory
var model = new MarkovModel()
var text = fs.readFileSync(argv.readMemory, "utf8").toLowerCase().split('.').filter(word => { return word != ""; });

for (var i = 0; i < text.length; i++) {
    model.addSentence(text[i]);
}

// variable for determining whether or not the bot is recording messages
var isListening = argv.isListening;


//### FUNCTIONS ###

//Process each message that the bot hears.
//Input:
//  DiscordMessage msg: The message from which content will be extracted
//Output: none
function handleMessage(msg) {
    //Get string of msg content (in lower case only)
    c = msg.content.toLowerCase()
    //cull all bot messages (to prevent bot feedback loops)
    if (msg.author.bot) return;

    //if (c.includes("beckbot") || c.includes("bb") || c.includes("shark")) return; //quick fix to cull unwanted words from chat

    //Command: "yume stop listening"
    //bot will stop recoding messages
    if (c.startsWith("yume stop listening")) {
        isListening = false;
        msg.reply("Yumeko is covering her stream receptors >w<")

        //Command: "yume listen"
        //bot will start recording messages to the memory file and to the model 
    } else if (c.startsWith("yume listen")) {
        isListening = true;
        msg.reply("Yumeko will do her best!")

        //Command: "yume speak"
        //the bot will produce a sentence from the markov model
    } else if (c.includes("yume") && c.includes("speak")) {
        if (c.includes("10")) {
            var str = "";
            for (var i = 0; i < 10; i++) {
                str += model.synthesizeSentence();
                str += "\n";
            }
            msg.channel.send(str)
        } else {
            msg.channel.send(model.synthesizeSentence())
        }

        //If no command and is listening
        //Silently listen to messages and record them to the model and memory
    } else if (c.length > 9 && isListening) {
        console.log(c)
        model.addSentence(c)
        fs.appendFileSync(argv.writeMemory, c + "\n")
    }

}

//### EVENT HANDLERS ###
client.on("messageCreate", msg => {
    handleMessage(msg)
})

client.on("ready", () => {
    console.log("Yume ready!")
})