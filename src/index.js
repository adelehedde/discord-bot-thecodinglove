const axios = require('axios');
const cheerio = require('cheerio');

const properties = { randomCodingLovePostUrl: 'https://thecodinglove.com/random' };

function getRequiredEnvVar(envVarName) {
	const envVar = process.env[envVarName];
	if (envVar == null) {
		throw new Error(`Environment variable ${envVarName} is not set !`);
	}
	return envVar;
}

async function getResource(url) {
	console.log(`[INFO] Getting resource from ${url}`);
	const response = await axios.get(url);
	return response.data;
}

async function postResource(url, json) {
	console.log(`[INFO] Posting resource to ${url}`);
	return axios.post(url, json);
}

function extractBlogPost(htmlDocument) {
	const $ = cheerio.load(htmlDocument);
	const blogPost = {};
	blogPost.title = $('h1.blog-post-title.single-blog-post-title').text();
	blogPost.url = $('#copyLinkBtn').attr('data-clipboard-text');
	blogPost.author = $('div.post-meta-info').text().substring(2);
	
	const blogPostMediaNode = $('div .blog-post-content p');
	const firstBlogPostMediaNode = blogPostMediaNode.children().first().get(0);
	if (firstBlogPostMediaNode.name === 'video') {
		blogPost.mediaUrl = firstBlogPostMediaNode.children[2].attribs.data;
	} else if (firstBlogPostMediaNode.name === 'img' ) {
		blogPost.mediaUrl = firstBlogPostMediaNode.attribs['data-src'];
	} else {
		throw new Error('Unable to extract media from html !');
	}	
	return blogPost;
}

function buildDiscordMessageTemplate() {
	return { content: null, embeds: [ { title: null, url: null, color: 15593457, footer: { 'text': null }, 'image': { 'url': null } } ] };
}

function buildDiscordMessage(blogPost) {
	const discordMessageTemplate = buildDiscordMessageTemplate();
	discordMessageTemplate.embeds[0].title = blogPost.title;
	discordMessageTemplate.embeds[0].url = blogPost.url;
	discordMessageTemplate.embeds[0].footer.text = blogPost.author;
	discordMessageTemplate.embeds[0].image.url = blogPost.mediaUrl;
	console.log(`[DEBUG] ${JSON.stringify(discordMessageTemplate)}`);
	return discordMessageTemplate;
}

async function main() {
	try {
		console.log('[INFO] Discord Bot Thecodinglove');
		const discordWebhookUrl = getRequiredEnvVar('DISCORD_WEBHOOK_URL');
		const htmlDocument = await getResource(properties.randomCodingLovePostUrl);
		const blogPost = extractBlogPost(htmlDocument);
		const discordMessage = buildDiscordMessage(blogPost);
		postResource(discordWebhookUrl, discordMessage);
	} catch(error) {
		console.log(error);
		process.exit(1);
	}	
}

main();
