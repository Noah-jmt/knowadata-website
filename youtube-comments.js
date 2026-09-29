// --------------------------------------------------
// YOUTUBE COMMENT ANALYZER
// Build 001
// --------------------------------------------------

const analyzeButton = document.getElementById("analyze-button");
const youtubeUrlInput = document.getElementById("youtube-url");

const results = document.getElementById("results");
const commentCount = document.getElementById("comment-count");

const topWords = document.getElementById("top-words");
const topBigrams = document.getElementById("top-bigrams");

const sentiment = document.getElementById("sentiment");



// --------------------------------------------------
// ANALYZE BUTTON
// --------------------------------------------------

analyzeButton.addEventListener("click", async () => {

    const youtubeUrl = youtubeUrlInput.value.trim();

    if (!youtubeUrl) {
        alert("Paste a YouTube video URL first.");
        return;
    }

    const videoId = getYouTubeVideoId(youtubeUrl);

    if (!videoId) {
        alert("That doesn't look like a valid YouTube video URL.");
        return;
    }

    analyzeButton.disabled = true;
    analyzeButton.textContent = "Loading comments...";

    try {

        // ------------------------------------------
        // GET COMMENTS FROM OUR CLOUDFLARE API
        // ------------------------------------------

        const response = await fetch(
            `/api/youtube-comments?videoId=${encodeURIComponent(videoId)}`
        );

        const data = await response.json();

        if (!response.ok) {
            console.error(data);
            throw new Error(
                data.error || "Unable to retrieve comments."
            );
        }

        console.log(data);


        // ------------------------------------------
        // SHOW COMMENT COUNT
        // ------------------------------------------

        commentCount.textContent = data.commentCount;


        // ------------------------------------------
        // GET COMMENT TEXT
        // ------------------------------------------

        const comments = data.comments || [];

        const commentTexts = comments
            .map(comment => comment.text || "")
            .filter(text => text.length > 0);


        // ------------------------------------------
        // RUN BASIC TEXT ANALYSIS
        // ------------------------------------------

        const wordResults = getTopWords(commentTexts, 15);

        const bigramResults = getTopBigrams(commentTexts, 15);
	const sentimentResults = getSentimentBreakdown(commentTexts);


        // ------------------------------------------
        // DISPLAY RESULTS
        // ------------------------------------------

        displayFrequencyResults(
            topWords,
            wordResults
        );

        displayFrequencyResults(
            topBigrams,
            bigramResults
        );

	displaySentiment(sentiment, sentimentResults);


        // ------------------------------------------
        // SHOW RESULTS PANEL
        // ------------------------------------------

        results.classList.remove("hidden");


    } catch (error) {

        console.error(error);
        alert(error.message);

    } finally {

        analyzeButton.disabled = false;
        analyzeButton.textContent = "Analyze Comments";
    }
});


// --------------------------------------------------
// GET YOUTUBE VIDEO ID
// --------------------------------------------------

function getYouTubeVideoId(url) {

    try {

        const parsedUrl = new URL(url);

        // youtube.com/watch?v=VIDEO_ID
        if (parsedUrl.hostname.includes("youtube.com")) {
            return parsedUrl.searchParams.get("v");
        }

        // youtu.be/VIDEO_ID
        if (parsedUrl.hostname === "youtu.be") {
            return parsedUrl.pathname.slice(1);
        }

        return null;

    } catch {
        return null;
    }
}


// --------------------------------------------------
// STOP WORDS
//
// Words that are common in English but usually
// don't tell us much about the subject.
// --------------------------------------------------

const stopWords = new Set([

    "a",
    "about",
    "after",
    "again",
    "all",
    "also",
    "am",
    "an",
    "and",
    "any",
    "are",
    "as",
    "at",
    "be",
    "because",
    "been",
    "but",
    "by",
    "can",
    "could",
    "did",
    "do",
    "does",
    "for",
    "from",
    "get",
    "got",
    "had",
    "has",
    "have",
    "he",
    "her",
    "here",
    "him",
    "his",
    "how",
    "i",
    "if",
    "in",
    "is",
    "it",
    "its",
    "just",
    "like",
    "me",
    "more",
    "my",
    "no",
    "not",
    "of",
    "on",
    "one",
    "or",
    "our",
    "out",
    "really",
    "so",
    "some",
    "that",
    "the",
    "their",
    "them",
    "then",
    "there",
    "they",
    "this",
    "to",
    "too",
    "up",
    "very",
    "was",
    "we",
    "were",
    "what",
    "when",
    "with",
    "would",
    "you",
    "your"
]);


// --------------------------------------------------
// CLEAN TEXT
// --------------------------------------------------

function cleanText(text) {

    return text
        .toLowerCase()
        .replace(/https?:\/\/\S+/g, " ")
        .replace(/[^a-z0-9'\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}


// --------------------------------------------------
// TOKENIZE COMMENT
// --------------------------------------------------

function getWords(text) {

    const cleaned = cleanText(text);

    if (!cleaned) {
        return [];
    }

    return cleaned
        .split(" ")
        .filter(word =>
            word.length > 1 &&
            !stopWords.has(word)
        );
}


// --------------------------------------------------
// TOP WORDS
// --------------------------------------------------

function getTopWords(comments, limit = 15) {

    const counts = {};

    comments.forEach(comment => {

        const words = getWords(comment);

        words.forEach(word => {

            counts[word] = (counts[word] || 0) + 1;

        });

    });

    return sortCounts(counts, limit);
}


// --------------------------------------------------
// TOP TWO-WORD PHRASES
// --------------------------------------------------

function getTopBigrams(comments, limit = 15) {

    const counts = {};

    comments.forEach(comment => {

        const words = getWords(comment);

        for (let i = 0; i < words.length - 1; i++) {

            const phrase = `${words[i]} ${words[i + 1]}`;

            counts[phrase] = (counts[phrase] || 0) + 1;

        }

    });

    return sortCounts(counts, limit);
}


// --------------------------------------------------
// SORT COUNTS
// --------------------------------------------------

function sortCounts(counts, limit) {

    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit);
}


// --------------------------------------------------
// DISPLAY FREQUENCY RESULTS
// --------------------------------------------------

function displayFrequencyResults(container, items) {

    if (!container) {
        return;
    }

    if (!items.length) {

        container.innerHTML =
            "<p>No results found.</p>";

        return;
    }

    const list = document.createElement("ol");

    items.forEach(([text, count]) => {

        const item = document.createElement("li");

        item.textContent = `${text} — ${count}`;

        list.appendChild(item);

    });

    container.innerHTML = "";
    container.appendChild(list);
}


// --------------------------------------------------
// SENTIMENT ANALYSIS
// --------------------------------------------------

const positiveWords = new Set([
    "amazing",
    "awesome",
    "best",
    "beautiful",
    "cool",
    "enjoy",
    "enjoyed",
    "excellent",
    "fantastic",
    "favorite",
    "good",
    "great",
    "helpful",
    "impressive",
    "interesting",
    "love",
    "loved",
    "nice",
    "perfect",
    "recommend",
    "thanks",
    "thank",
    "useful"
]);

const negativeWords = new Set([
    "annoying",
    "awful",
    "bad",
    "boring",
    "broken",
    "disappointed",
    "disappointing",
    "hate",
    "hated",
    "horrible",
    "issue",
    "issues",
    "problem",
    "problems",
    "terrible",
    "ugly",
    "useless",
    "worse",
    "worst"
]);


function getSentimentBreakdown(comments) {

    let positive = 0;
    let neutral = 0;
    let negative = 0;

    comments.forEach(comment => {

        const words = cleanText(comment).split(" ");

        let score = 0;

        words.forEach(word => {

            if (positiveWords.has(word)) {
                score++;
            }

            if (negativeWords.has(word)) {
                score--;
            }

        });

        if (score > 0) {
            positive++;
        } else if (score < 0) {
            negative++;
        } else {
            neutral++;
        }

    });

    const total = comments.length;

    if (total === 0) {
        return {
            positive: 0,
            neutral: 0,
            negative: 0
        };
    }

    return {
        positive: Math.round((positive / total) * 100),
        neutral: Math.round((neutral / total) * 100),
        negative: Math.round((negative / total) * 100)
    };
}


// --------------------------------------------------
// DISPLAY SENTIMENT
// --------------------------------------------------

function displaySentiment(container, results) {

    container.innerHTML = `
        <p>Positive: ${results.positive}%</p>
        <p>Neutral: ${results.neutral}%</p>
        <p>Negative: ${results.negative}%</p>
    `;
}