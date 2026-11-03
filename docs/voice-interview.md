# Voice mock interview

Local preview now defaults to the Doubao Seeduplex realtime room. See `docs/doubao-realtime.md` for the current setup and limitations. The chat/transcription implementation below remains the fallback on static hosting; do not use its Groq setup instructions for the new local realtime room.

Open `#practice/interviews`, then choose **Enter interview room**. The room is also directly available at `#mock-interview`. Previous written practice stays available below the new entry.

## Configuration

Copy `.env.example` to `.env.local`, enter credentials locally and restart the local server. The local server reads `.env.local` and `.env` without overwriting existing environment variables. On Vercel configure environment variables in project settings and redeploy.

For Groq, set only `GROQ_API_KEY`. The interview uses `llama-3.3-70b-versatile` for chat and `whisper-large-v3-turbo` for transcription. These are subject to the provider's available models, free quotas and terms. Update `INTERVIEW_MODEL` when necessary. No live request was validated without credentials.

For another OpenAI-compatible chat provider, set `INTERVIEW_API_KEY`, `INTERVIEW_BASE_URL` (the prefix before `/chat/completions`), and `INTERVIEW_MODEL`. Existing `AI_*` variables can also be reused. Speech can still use `GROQ_API_KEY` independently. Without that speech key, the room uses browser SpeechRecognition if available, otherwise typed answers remain available. Browser speech recognition can depend on the browser vendor's online service and browser support is uneven.

The school's supplied guide gives `https://genai.comp.polyu.edu.hk/api/v1` and model `DeepSeek-V4-Flash`. It explicitly restricts access to the PolyU campus network. The guide does not provide a text-extracted usable credential or a speech endpoint. A public Vercel deployment cannot be assumed to reach this campus-only service. Obtain credentials through the school's authorized process; never put them in frontend code or chat.

## Interaction and privacy

- Choose role, difficulty, interview language, 5/6/8 rounds, and optional project context. Consent is required before sending text to the configured AI provider; the room identifies the provider hostname and model.
- The AI asks one question at a time and receives the conversation so it can follow up. Device speech synthesis reads questions aloud. Replay, stop playback and mute are available. Autoplay and voices depend on the device; text remains readable.
- Start recording explicitly; the camera is separate and optional. Stop recording to transcribe, check/edit the answer, then submit. Each recording is capped at 90 seconds and 3 MB. Browser recognition may end earlier depending on the browser.
- Video is local preview only. Groq mode uploads the audio to Groq for transcription, then sends confirmed text to the configured chat provider. No video, raw audio or private credentials are stored in localStorage. Provider data policies still apply.
- Microphone tracks stop after recording. Camera and microphone tracks, synthesis and pending requests are released when leaving the room or ending the interview. Changing the page language interrupts pending operations but retains the in-memory conversation.
- Ending after at least one submitted answer generates a structured review: summary, evidence-based strengths, improvements, one rewritten answer and next steps. There is no hiring score or analysis of appearance, voice, emotion or personality. Failed providers never fall back to invented AI output.
- Reviews and transcripts persist only after **Save review**, in the current browser, limited to 20 sessions; saved reviews can be reopened in the room. They are not added to the older rule-based interview scoring system.

The API includes same-origin checks, validation, per-instance request limits and upstream timeouts. It remains a course prototype, with no account authentication or durable per-account quota. Before a wider release, add authentication and durable quotas. Vercel permits microphone/camera only for this origin; the browser still requests user permission.

## Verification

Automated tests exercise provider routing, turn validation, response parsing, consent-independent backend validation, missing credentials, cross-origin rejection, provider rate limits, audio validation and transcription forwarding using test fixtures. Browser checks cover the real unconfigured UI, language/role controls, entry navigation and honest connection status. A separate localhost test origin with explicitly labelled fixture responses verified the five-answer sequence, automatic review, saving, reload and reopening; it never called an AI provider or requested media devices. Actual microphone/camera permissions, recognition accuracy, voice playback and provider conversations must be tested on the user's browser with configured credentials; no fixture is presented as a live interview.
