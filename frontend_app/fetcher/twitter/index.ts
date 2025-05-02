import { Scraper } from "agent-twitter-client";


export const fetchTwitter = async (username: string) => {
    const scraper = new Scraper();
    if (!process.env.TWITTER_USERNAME || !process.env.TWITTER_PASSWORD) {
        throw new Error("TWITTER_USERNAME and TWITTER_PASSWORD must be set");
    }
    scraper.login(
        process.env.TWITTER_USERNAME,
        process.env.TWITTER_PASSWORD
    );
    return await scraper.getLatestTweet(username);
}

