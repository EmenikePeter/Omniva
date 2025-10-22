# Omniva Backend (Phase 1 - Cohere)

## Setup
1. Copy .env.example → .env and fill MONGO_URI & COHERE_API_KEY
2. Install dependencies:
   bash
   cd backend
   npm install

3. Run dev server:

npm run dev


4. API endpoints:

POST /api/chat { user_id, message, lang }

POST /api/tools/expense { user_id, amount, category, note }

POST /api/tools/idea { user_id, sector, lang }

POST /api/tools/symptom { user_id, symptoms, lang }




Notes

This uses Cohere SDK. Sign up for Cohere and get API key: https://cohere.ai

This structure is intentionally modular: swap aiService to route to self-hosted models later (Phase 3).


---

# How to run (quick)
1. From project root:
bash
cd omniva/backend
cp .env.example .env
# edit .env and add MONGO_URI and COHERE_API_KEY
npm install
npm run dev

2. Test endpoints with Postman or frontend:



POST http://localhost:5000/api/chat
Body JSON: { "user_id": "alpha1", "message": "Give me business ideas for Lagos", "lang":"en" }



---

Why this structure is Phase-3 ready

aiService.js is a single place to switch providers (Cohere now). To move to Phase 3, update aiService.askAI() to:

call a RAG pipeline (vector DB + local model), or

call a self-hosted model endpoint (Ollama).


Chat history stored in ChatMessage model will become your training data.

tools.controller uses askAI for idea/symptom generation — same API will use custom models later.


