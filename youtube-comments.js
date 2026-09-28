// YouTube Comment Analyzer
// Build 001

const analyzeButton = document.getElementById("analyze-button");
const youtubeUrlInput = document.getElementById("youtube-url");
const results = document.getElementById("results");
const commentCount = document.getElementById("comment-count");


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

        const response = await fetch(
            `/api/youtube-comments?videoId=${encodeURIComponent(videoId)}`
        );

        const data = await response.json();

        if (!response.ok) {
            console.error(data);
            throw new Error(data.error || "Unable to retrieve comments.");
        }

        console.log(data);

        commentCount.textContent = data.commentCount;
        results.classList.remove("hidden");

    } catch (error) {

        console.error(error);
        alert(error.message);

    } finally {

        analyzeButton.disabled = false;
        analyzeButton.textContent = "Analyze Comments";
    }
});


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