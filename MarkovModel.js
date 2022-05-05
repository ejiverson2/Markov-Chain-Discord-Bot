class MarkovModel {
    constructor() {
        this.root = new MarkovNode();
        this.nodePtr;
        this.endNode = new MarkovNode("!end");
        this.graphTracker = [];
    }

    //Break a sentence down to individual words and record their relationships to the model
    //Input:
    //  str str: String containing a complete sentence
    //Output: none
    addSentence(str) {
        var arr = str.split(/[^0-9a-z:',|\-<@!>]/gi).filter(word => {//re.split("/[^0-9a-z:'-<@!>]/gi", yourSentence)
            return word != "";
        });
        if (arr.length < 2) return;

        this.addFirst(arr[0]);
        for (var i = 1; i < arr.length; i++) {
            this.addWord(arr[i]);
            if (i == arr.length - 1)
                this.addEnd()
        }
    }

    //Insert a sentence-starting word to the model
    //Input:
    //  str word: the word that starts a sentence
    //Output: none
    addFirst(word) {
        var lookup = this.lookUp(word)
        if (lookup == undefined) {
            this.root.nextWords.set(word, [1, new MarkovNode(word)])
        } else {
            if (this.root.nextWords.get(word) != undefined)
                this.root.nextWords.set(word, [this.root.nextWords.get(word)[0] + 1, lookup])
            else
                this.root.nextWords.set(word, [1, lookup])
        }
        this.nodePtr = this.root.nextWords.get(word)[1];
    }

    //Insert a non-starter word to the model
    //Input:
    //  str word: the word to add
    //Output: none
    addWord(word) {
        var lookup = this.lookUp(word)
        if (lookup == undefined) {
            this.nodePtr.nextWords.set(word, [1, new MarkovNode(word)])
        } else {
            if (this.nodePtr.nextWords.get(word) != undefined)
                this.nodePtr.nextWords.set(word, [this.nodePtr.nextWords.get(word)[0] + 1, lookup])
            else
                this.nodePtr.nextWords.set(word, [1, lookup])
        }
        this.nodePtr = this.nodePtr.nextWords.get(word)[1];
    }

    //Add the end of sentence token
    //Input: none
    //Output: none
    addEnd() {
        if (this.nodePtr.nextWords.get("!end") == undefined) {
            this.nodePtr.nextWords.set("!end", [1, undefined])
        } else {
            this.nodePtr.nextWords.get("!end")[0]++;
        }
    }

    //Helper function for the function "lookUp". Checks the list of already searched
    //words and returns true if word is found.
    //Input:
    //  str word: word to look up
    //Output:
    //  bool wordFound
    findInGraphTracker(word) {
        for (var i = 0; i < this.graphTracker.length; i++) {
            if (this.graphTracker[i] == word) return true;
        }
        return false;
    }

    //Look up a word in the graph and return the associated node
    //Input:
    //  str word: word to look up
    //Output:
    // [node] node in model representing the word
    lookUp(word) {
        var r = this._lookUp(word, this.root)
        this.graphTracker = [];
        return r;
    }

    _lookUp(word, node) {
        if (node.word == word) {
            return node;
        }
        var r;
        for (var [key, value] of node.nextWords) {
            if (value[1] != undefined) {
                if (this.findInGraphTracker(key)) continue;
                this.graphTracker.push(key);
                r = this._lookUp(word, value[1]);
                if (r != undefined)
                    return r;
            }
        }
        return undefined;
    }

    //Return a randomly selected node from a list of nodes based on
    //how many times they were linked to the original node owning the list
    //Input:
    //  map map: list of nodes-weight pairs
    //Output:
    //  [node] node: represents the word chosen
    weightedRNG(map) {
        var total = 0;
        var words = [];
        var sections = [];
        for (var [k, v] of map.entries()) {
            total += v[0];
            words.push(k);
            sections.push(total);
        }
        var rng = Math.floor(Math.random() * total);
        for (var i = 0; i < sections.length; i++)
            if (rng < sections[i])
                return words[i]
    }

    //Run through the model and form a sentence, starting with a randomly selected
    //starter word and ending when an end token is found
    //Input: none
    //Output:
    //  str sentence
    synthesizeSentence() {
        var r = "";

        var word = this.weightedRNG(this.root.nextWords);
        var currentNode = this.root.nextWords.get(word)[1];
        var length = 0
        while (word != "!end" && length < 50) {
            r += word + " ";
            length++;
            word = this.weightedRNG(currentNode.nextWords);
            currentNode = currentNode.nextWords.get(word)[1];
        }

        return r;
    }
}

//Class for nodes representing each word and its associations
//Properties:
//  str word: the word represented by the node
//  Map nextWords: a list of words that follow the word paired with a weight
//                The weight is the number of times a word has followed the node word
class MarkovNode {
    constructor(word) {
        this.word = word;
        this.nextWords = new Map();
    }
}

module.exports = MarkovModel;