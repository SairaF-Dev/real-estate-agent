# Real Estate Assistant

An AI platform for a real estate agency that combines **Sara**, an UrduLish conversational assistant (website chat, browser voice and phone), with a **property valuation and lead scoring API** powered by machine learning and explainable AI.

The repository is a monorepo organised by development phase:

| Folder | Description |
| --- | --- |
| [`Week7/`](Week7/) | Sara assistant: architecture, RAG and retrieval, conversational agent, appointment workflows, LangGraph orchestration, website and VAPI voice integration |
| [`Week8/`](Week8/) | Valuation and lead scoring platform: data pipeline, dual Sale and Rent regression models, lead classifier, SHAP explanations, FastAPI service, MLOps |

---

## Highlights

- **UrduLish assistant (Sara)** with website chat, browser voice and VAPI phone integration
- **Retrieval grounded answers:** PostgreSQL supplies property facts, the LLM only interprets requests
- **Hybrid retrieval:** structured SQL retrieval combined with semantic RAG
- **Appointment automation:** booking, rescheduling and cancellation with Google Calendar, email and n8n workflows
- **Dual valuation models:** separate Sale (capital value) and Rent (monthly rent) regressors with prediction ranges
- **Lead scoring:** conversion probability, lead personas and ranked lead lists
- **Explainable AI:** TreeSHAP attributions for both price and lead predictions
- **MLOps:** monitoring, validation gated model promotion, rollback and Docker based serving
- **Security:** HttpOnly session cookies, CSRF validation, account ownership checks and separate service credentials

---

## System Architecture

```text
Website (3000) --> Website API (8010) --> Shared Sara services
   |                    ^                     |
   +--> VAPI voice --> Webhook (8007)          +--> Understanding and policies
Phone --> VAPI ------> Webhook (8007)          +--> PostgreSQL retrieval and RAG
                                               +--> Ranking (deterministic, optional ML)
                                               +--> Appointment service (8004)
                                               +--> Week 8 valuation and lead API
```

### Week 8 valuation routing

```text
Valuation query --> check purpose
   For Sale --> Sale preprocessing --> Sale regressor --> Fair purchase price (estimate and range)
   For Rent --> Rent preprocessing --> Rent regressor --> Fair monthly rent (estimate and range)
```

Sale and Rent are modelled separately because their targets differ by roughly 300 times in scale (median PKR 13.5M for sale versus PKR 45k for rent), and pooling them would let sale price errors overwhelm the entire rental range.

---

## Repository Structure

```text
real-estate-agent/
├── Week7/
│   ├── day1/   Architecture, persona, conversation flows, prompt specifications
│   ├── day2/   Knowledge base, PostgreSQL schema, RAG, structured retrieval, recommendations
│   ├── day3/   Conversational agent, understanding, memory, standalone interfaces
│   ├── day4/   Appointment API, Calendar, email, CRM, n8n workflows
│   ├── day5/   LangGraph orchestration and tests
│   ├── day6/   Conversation and performance evaluation reports
│   ├── day7/   Website (Next.js), web API, shared services, VAPI integration, offline ML
│   └── docs/   Client guide, admin guide, API security, maintenance plan
└── Week8/
    ├── src/
    │   ├── data/       Cleaning pipelines and lead generator
    │   ├── features/   Property and lead feature pipelines
    │   ├── models/     Training, evaluation, prediction, explainability, guardrails
    │   ├── api/        FastAPI application and schemas
    │   ├── agent/      LangGraph assistant and tools
    │   └── mlops/      Monitoring and retraining
    ├── models/         Trained model artifacts
    ├── docs/           Architecture, operations, model cards, deployment guides
    └── tests/          Automated test suites
```

---

## Tech Stack

| Area | Technologies |
| --- | --- |
| Backend | Python 3.11+, FastAPI, Uvicorn, Pydantic |
| Machine learning | scikit-learn, LightGBM, XGBoost, CatBoost, SHAP |
| Orchestration | LangGraph, LangChain Core |
| LLM access | OpenRouter (OpenAI compatible client) |
| Voice | VAPI (browser and phone) |
| Database | PostgreSQL (Neon in deployment) |
| Frontend | Next.js |
| Workflows | n8n, Google Calendar, Google Apps Script email relay |
| Deployment | Docker, Railway, Neon |

---

## Week 8 API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/predict/price` | Price estimate for Sale or Rent |
| POST | `/predict/lead-score` | Lead conversion probability |
| POST | `/predict/batch` | Batch predictions |
| POST | `/explain/price` | SHAP explanation for a price estimate |
| POST | `/explain/lead` | SHAP explanation for a lead score |
| POST | `/assistant/chat` | LangGraph powered sales assistant |
| GET | `/market/stats` | Market statistics |
| GET | `/market/insights` | Market insights |
| GET | `/properties`, `/properties/{property_id}` | Property catalog and details |
| GET | `/leads`, `/leads/{lead_id}` | Lead list and details |
| GET | `/health`, `/model/info` | Health check and model metadata |

Interactive documentation is available at `/docs` when a service is running.

---

## Getting Started

### Prerequisites

- Python 3.11 or newer
- PostgreSQL
- Node.js and npm (for the website)
- Optional: VAPI account, OpenRouter API key, Google service account

### Run the Week 8 API

```bash
cd Week8
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements-api.txt
uvicorn src.api.app:app --reload
```

Open `http://localhost:8000/docs`. Model inference works with the included artifacts in `Week8/models/`.

### Run the Week 7 services

Detailed setup, environment variables, database migrations and service commands are in the [Week 7 README](Week7/README.md). In short:

| Service | Port |
| --- | --- |
| Appointment API (Day 4) | 8004 |
| Website API | 8010 |
| VAPI webhook | 8007 |
| Website (Next.js) | 3000 |

### Configuration

Create `.env` files manually in each service folder. Never commit secrets.

```env
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/DATABASE
OPENROUTER_API_KEY=
SARA_LLM_MODEL=
DAY4_API_URL=http://localhost:8004
DAY4_API_KEY=
VAPI_ASSISTANT_ID=
VAPI_WEBHOOK_SECRET=
SARA_ML_RANKING_MODE=off
```

---

## Testing

```bash
# Week 8 (from the Week8 folder)
pytest tests -q

# Week 7 (from the Week7 folder)
python -m pytest day7/tests day7/vapi_integration/tests -q
```

Some tests require PostgreSQL, external providers or extra dependencies.

---

## Deployment

The services deploy to **Railway** with **Neon** PostgreSQL. Follow the [Railway and Neon deployment guide](Week8/docs/day5/railway_free_deployment.md). Add credentials only through each service's secret variable settings.

Further operations documentation:

- [Operations guide](Week8/docs/day5/operations.md)
- [Architecture](Week8/docs/day5/architecture.md)
- [Model cards](Week8/docs/day5/model_cards.md)
- [Sales agent guide](Week8/docs/day5/sales_agent_guide.md)

---

## Model Performance

Metrics from locked test sets, as documented in the Week 8 README.

| Model | Metric | Result | Target |
| --- | --- | --- | --- |
| Sale valuation | MAPE | 17.17% | Below 15% |
| Rent valuation | MAPE | 16.96% | Below 15% |
| Lead scoring | PR AUC | 0.6055 | Above baseline |
| Lead scoring | Precision at top 20% | 58.0% | n/a |

Both valuation models currently sit above the 15% MAPE target. Lead models were trained on synthetic leads.

---

## Data and Runtime Scope

Property and lead data files are intentionally **not distributed** in this public repository.

- **Works out of the box:** model inference using the included model artifacts.
- **Requires private data:** catalog backed search, comparable property, market statistics and lead list endpoints. Without authorised data provisioned privately, these endpoints return no records.

Data sources: property listings are based on public Zameen.com data (Kaggle). Lead data is generated by a calibrated behavioural simulator. Seed listings in Week 7 are demonstration data.

---

## Author

**Saira Fatima**
