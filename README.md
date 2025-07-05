# YouTube-Content-Generator-using-N8N
<img width="416" alt="Screenshot 2025-07-05 at 5 55 25 pm" src="https://github.com/user-attachments/assets/2c6b7779-f618-4e50-8ba3-d7ddab1bd970" />
<img width="1115" alt="Screenshot 2025-07-05 at 6 06 07 pm" src="https://github.com/user-attachments/assets/a6c9b553-c150-4b92-8592-dc2171e26fae" />

This project is a web-based tool that helps YouTube creators write SEO-friendly video descriptions and titles.
Users paste a video URL, pick their content preferences (language, tone, audience, length), and the app returns a ready-to-use description, title, hashtags, and tags in a single click.

**Key Features**
AI-powered copywriting – Uses large-language-model prompts to analyse the video and draft content that follows YouTube best practices.

Language selector – English, French, Spanish, or Hindi.

Tone of voice – Conversational, Informative, Funny / Casual, or Inspirational.

Audience focus – Beginners, Advanced users, Students, or Professionals.

Flexible length – Short, Standard, or Long descriptions.

One-click generation – Press “Generate Content” to receive a full description, title, tags, and hashtags.

**Tech Stack**

**Front end** 	React + Vite + Tailwind = CSS	Fast build and modern styling.
**State / forms** 	React Hook Form	 = Handles validations and field state.
**API requests**	rapidapi.com for youtube summary. https://rapidapi.com/rahilkhan224/api/youtube-video-summarizer-gpt-ai/playground 
**Back end**	N8N
**AI service**	Mistral or any llm of your choice. 


**How the n8n workflow works — step by step**
| #  | Node name                        | What it does                                                                                                                                                                                                                                                                                                             |
| -- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1  | **Webhook2**                     | Entry point. The front-end calls this webhook with a JSON payload that contains the YouTube URL plus the user’s form selections (language, tone, audience, length).                                                                                                                                                      |
| 2  | **separate video id3** (Code)    | Extracts the 11-character video ID from the URL and stores it as `videoId` for downstream use. Handles both long (`watch?v=`) and short (`youtu.be/`) formats.                                                                                                                                                           |
| 3  | **HTTP Request3**                | Calls a transcripts endpoint such as `https://youtube-video-subtitles.p.rapidapi.com/transcript/{videoId}` (or your own serverless wrapper) and retrieves the raw captions in JSON.                                                                                                                                      |
| 4  | **Edit Fields3**                 | Cleans up the HTTP response: keeps only the text of each caption, discards timing, and renames the field to something short like `chunk`.                                                                                                                                                                                |
| 5  | **combined transcripts3** (Code) | Concatenates all caption chunks into one long string called `transcript`. It also trims the text if it is longer than the token limit you set for the language model.                                                                                                                                                    |
| 6  | **seo description** (AI Agent)   | Sends a prompt that contains: 1) the transcript, and 2) the user’s preferences. The prompt template lives in this node. The request is routed to the **Google Gemini Chat Model** (dashed arrow). The model returns a full SEO-optimised description, an engaging title, tags, and hashtags in a structured JSON format. |
| 7  | **Code8**                        | Parses the model’s JSON, checks for missing keys, and normalises casing (e.g., `"description"` not `"Description"`). It also escapes any characters that would break JSON when sent back to the browser.                                                                                                                 |
| 8  | **AI Agent7**                    | A second, lightweight AI pass. This is where you optionally translate the output, rewrite it in a different tone, or shorten / lengthen the copy if the user changed their mind after the first call.                                                                                                                    |
| 9  | **Code9**                        | Merges the outputs of the two AI agents, giving priority to the user’s latest choices. Adds metadata such as `timestamp` and `videoId` so the front-end can cache the result.                                                                                                                                            |
| 10 | **Code10**                       | Builds the final response object expected by the UI: `{ "title": "...", "description": "...", "tags": [...], "hashtags": [...] }`.                                                                                                                                                                                       |
| 11 | **Respond to Webhook2**          | Sends the JSON back to the original request. The UI shows the description instantly, ready for copy-paste.                                                                                                                                                                                                               |
