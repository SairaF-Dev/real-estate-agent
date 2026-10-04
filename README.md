# Real Estate Assistant

This repository contains the Week 7 application services and Week 8 valuation and lead-scoring API.

## Deployment

Follow the [Railway and Neon deployment guide](Week8/docs/day5/railway_free_deployment.md). Add credentials only to the relevant service's secret-variable settings.

## Data and runtime scope

Property and lead data files are intentionally not distributed in this public repository. Model inference can run with the included model artifacts. Catalog-backed search, comparable-property, market-statistics, and lead-list endpoints require authorized data to be provisioned privately; without it, those endpoints have no records.

The included models are not a guarantee of valuation accuracy or production availability. Review the deployment guide's limitations before exposing the services to customers.
