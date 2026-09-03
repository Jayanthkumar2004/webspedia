# Webspedia Backend Architecture

The local Express server (`server.js`) has been deprecated and removed.

The application now uses **Supabase** directly for:
- Database CRUD (`tools`, `comments`, `ratings`, `saved_tools`, `profiles`, `messages`)
- Realtime channels & subscriptions
- Storage buckets (`avatars`, `pdfs`, `chat-files`)
- User authentication & session management

No local Express process is required to run the Webspedia platform.
