# FleetOps - Web Application

Part of the **FleetOps Fleet & Logistics Dispatch System**, submitted for the
Enterprise Cloud Architecture (ITS 2130) capstone project.

## Student Information
- **Name:** K.D. Chanuth Dewhan
- **Student ID:** 241722017
- **Slack Handle:** @chanuthdewhan
- **GCP Project ID:** fleet-ops-506803

## Project Description
The FleetOps frontend — a dispatcher and driver web interface for managing
delivery orders, driver/vehicle assignments, trip tracking, and delivery
notifications, consuming the FleetOps microservices backend through the API
Gateway.

## Technology Stack
- React 19, TypeScript, Vite
- Tailwind CSS, shadcn/ui (Base UI)
- React Router, TanStack Query
- Axios, React Hook Form, Zod

## Setup / Getting Started

```bash
git clone https://github.com/chanuth/fleetops-webapp.git
cd fleetops-webapp
npm install
npm run dev
```

Configure the backend API URL in `.env`:'
VITE_API_BASE_URL=http://localhost:7000/api/v1

## Live Deployment
- **GCP Project ID:** fleet-ops-506803
- **Region:** asia-southeast1
- **Deployment model:** PaaS — Google Cloud Run
- **Live URL:** http://34.143.195.181:80