# Markov-Chain-Discord-Bot
### (also affectionately called Yumeko) 
A discord bot to that reads discord messages, adds them to a markov model, and then forms sentences from them.

The goal of this project was to make a discord bot that would learn to speak by listening to the chatter of any server it was apart of.

### The Language Model
All words and their relationships are stored as nodes in an interconnected web. Each node, representing a single word, has a list of words that proceed it. The list also stores the number of times each word has proceeded the node word.

The first node in the web is the start node and does not represent a word. It's list of next words are all words that have started sentences.
A node exists for the "end of sentence token" For this project I used "!end" as the EOS

### Sentence Synthization: Yumeko Speaks
When a user wants a sentence to be formed, the start node randomly picks a first word to start. Every next word is selected with a weighted probability based on how often the following word appeared. When an EOS is selected, the sentence is finished and is output to the respective discord channel.

### Running the bot
Requires NodeJS, DiscordJS, and Yargs
Your bot token needs to be in the config file.
Flags:
-l "isListening" boolean | if true, bot adds every sentence to its model and to its memory file
-r "readFile" string | specify file to read initial lines into the model
-w "writeFile" string | specify which file to save all messages to if isListening
Run: node bot.js -l true -r sampleMemory.txt -w memory.txt

Chat Commands:
"yume speak": form a sentence and post to chat
"yume listen": start adding new sentences to model and memory
"yume stop listening": stop adding to model/memory
