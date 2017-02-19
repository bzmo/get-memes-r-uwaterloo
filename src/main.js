/*
 *  Author: Bo Mo
 *  Date: February 2017
 */

const SECS_IN_A_DAY = 60*60*24;
const REDDIT_URL = 'https://www.reddit.com/r/uwaterloo/new/.json';
const COMMON_WORDS = {};
let WORDS_FREQ = [];
let TOP_MEMES = [];

/* Pushes to COMMON_WORDS each word found in the words array */
function addToCommonWords(words) {
  for (let i = 0; i < words.length; i++) {
    let word = words[i];
    COMMON_WORDS[word] = word;
  }
}

/* Initializes the words found in the COMMON_WORDS object */
function initCommonWords() {
  const commonPrepositions = ["about", "above", "across", "after", "against", "around",
                              "at", "before", "behind", "below", "beneath", "beside",
                              "besides", "between", "beyond", "by", "down", "during",
                              "except", "for", "from", "in", "inside", "into", "like",
                              "near", "of", "off", "on", "out", "outside", "over",
                              "since", "through", "throughout", "till", "to", "toward",
                              "under", "until", "up", "upon", "with", "without"];

  const commonPronouns = ["anything", "everyone", "everything", "he", "her",
                          "him", "himself", "i", "it", "itself", "me", "nothing",
                          "one", "she", "something", "someone", "them", "themselves",
                          "they", "us", "we", "who", "you"];

  const commonConjunctions = ["after", "although", "and", "as", "because", "before",
                              "but", "if", "like", "nor", "now", "once", "or",
                              "since", "so", "than", "that", "then", "though",
                              "unless", "until", "when", "whether", "while", "where"];

  // Arbitrarily chosen common words from the subreddit
  const otherWords = ["i'm", "can't", "don't", "dont", "haven't", "just", "am", "a", "an",
                      "are", "what", "how", "does", "is", "be", "it", "anyone",
                      "another", "do", "doing", "want", "instead", "these", "the",
                      "this", "getting", "get", "got", "have", "my", "all", "can",
                      "its", "your", "you've", "why", "whoever", "what's", "too",
                      "those", "there", "their", "some", "should", "she's", "he's",
                      "make", "it's", "isn't", "-", "did", "else", "it", "has", "not",
                      "any", "been", "here's", "uw", "waterloo", "university", "best", "students"];

  addToCommonWords(commonPrepositions);
  addToCommonWords(commonPronouns);
  addToCommonWords(commonConjunctions);
  addToCommonWords(otherWords);
}

/*
 * Parses title and keep track of its word counts in WORDS_FREQ for the given index
 *    if the word is not found in COMMON_WORDS
 */
function parseTitle(title, index) {
  let words = title.split(' ');

  for (let i = 0; i < words.length; i++) {
    let word = words[i].toLowerCase();
    if (COMMON_WORDS[word]) { return; }
    if (!WORDS_FREQ[index]) { WORDS_FREQ[index] = {}; }
    if (!WORDS_FREQ[index][word]) { WORDS_FREQ[index][word] = 0; }

    WORDS_FREQ[index][word]++; // Incremenet the word's count
  }
}

/*
 * Retrieves the title with the highest number of counts
 *   where titles is an object with titles and their counts, and index is for
 *   the index in which we are storing in the TOP_MEMES array
 */
function getTopMeme(titles, index) {
  let topCount = 0;
  let topTitle = null;

  for (let title in titles) {
    if (!titles.hasOwnProperty(title) || titles[title] <= topCount) { continue; }
    topCount = titles[title];
    topTitle = title;
  }

  TOP_MEMES[index] = topTitle;
}




function initWordsFreq (index, unixTime, afterAnchor) {
  let URL = (!afterAnchor) ? REDDIT_URL : REDDIT_URL + '?after=' + afterAnchor;

  fetch(URL).then( response => {
    response.json().then( listing => {
      let anchor = listing.data.after;
      let posts = listing.data.children;

      // Visit All Posts within the page
      for (let i = 0; i < posts.length; i++) {
        // Check if we past our unix time marker and stop if true
        if (posts[i].data.created < unixTime) {
          getTopMeme(WORDS_FREQ[index], index);
          console.log(TOP_MEMES);
          console.log(WORDS_FREQ);

          return afterAnchor;
        }

        console.log(posts[i].data.title);
        parseTitle(posts[i].data.title, index);
      }

      initWordsFreq(index, unixTime, anchor); // Recursively call
    });
  }).catch ( err => {
    console.log(err);
  });
}

function getMemesOfTheDay(daysCount) {
  let currentTime = (+ new Date()) / 1000;
  let afterAnchor = null;
  if (daysCount <= 0) { return; }

  for (let i = 0; i < daysCount; i++) {
    afterAnchor = initWordsFreq(i, currentTime - SECS_IN_A_DAY * (i + 1), afterAnchor);
  }
}

function main () {
  let daysCount = 19;

  // Initialize WORDS_FREQ, TOP_MEMES, ANCHORS with daysCount size
  for (let i = 0; i < daysCount; i++) {
    WORDS_FREQ.push({});
    TOP_MEMES.push({});
  }

  initCommonWords();            // Initialize COMMON_WORDS
  getMemesOfTheDay(daysCount);  // Populate WORDS_FREQ and TOP_MEMES
}

main();
