export async function onRequestGet(context) {

    // Get the video ID sent by the browser
    const url = new URL(context.request.url);
    const videoId = url.searchParams.get("videoId");

    if (!videoId) {
        return Response.json(
            { error: "Missing video ID." },
            { status: 400 }
        );
    }

    // API key lives safely in Cloudflare
    const apiKey = context.env.YOUTUBE_API_KEY;

    if (!apiKey) {
        return Response.json(
            { error: "YouTube API key is not configured." },
            { status: 500 }
        );
    }

    const youtubeUrl =
        "https://www.googleapis.com/youtube/v3/commentThreads" +
        "?part=snippet" +
        "&maxResults=100" +
        "&textFormat=plainText" +
        `&videoId=${encodeURIComponent(videoId)}` +
        `&key=${encodeURIComponent(apiKey)}`;

    try {

        const response = await fetch(youtubeUrl);
        const data = await response.json();

        if (!response.ok) {
            return Response.json(
                {
                    error: "YouTube API request failed.",
                    details: data
                },
                { status: response.status }
            );
        }

        const comments = data.items.map(item => {

            const comment =
                item.snippet.topLevelComment.snippet;

            return {
                author: comment.authorDisplayName,
                text: comment.textDisplay,
                likes: comment.likeCount,
                publishedAt: comment.publishedAt
            };

        });

        return Response.json({
            videoId: videoId,
            commentCount: comments.length,
            comments: comments,
            nextPageToken: data.nextPageToken || null
        });

    } catch (error) {

        return Response.json(
            {
                error: "Something went wrong.",
                details: error.message
            },
            { status: 500 }
        );
    }
}