# Sankalp 2026 - Project Features Summary

This document summarizes the architecture, files, and features implemented in the `Sankalp.irl` project up to this point, extracted from the current codebase.

## 1. System Architecture
The overall architecture follows a microservices pattern orchestrated via Docker Compose:
- **Node.js/Express Backend** (`Backend/`): Handles core application logic, authentication, and Postgres/PostGIS database interactions.
- **React Frontend** (`Frontend/`): Built with Vite and TailwindCSS to provide role-based user interfaces.
- **Python-based AI Microservices**:
  - `ai-service`: AI classification for text, audio, and images.
  - `communication-ai`: AI-driven communication agents.
  - `ml_vision` (`Feature3/`): Computer vision models exposed via a FastAPI service.
- **Data & Policy Engine** (`Feature2/`): Analytical Python models for causal inference and strategic policy optimization.

## 2. Core Features Implemented

### 📱 Frontend (User Interfaces)
The frontend uses role-based access control with specialized views:
- **Citizen Portal** (`CitizenPortal.jsx`): Allows citizens to submit complaints with precise map-based locations and media attachments, and track issue resolution status.
- **Ward Officer Dashboard** (`WardOfficerDashboard.jsx`): Interface for local officers to view, prioritize, and manage assigned complaints. Displays AI-calculated priority scores to surface critical issues first.
- **Municipal Admin Dashboard** (`MunicipalAdminDashboard.jsx`): High-level administrative overview. Allows admins to monitor city-wide metrics, review completed tasks, and features a "Reject Proof" flow enabling admins to send inadequate work proofs back to Ward Officers.
- **Public Feed** (`PublicFeed.jsx`): A community-facing feed showcasing resolved issues and positive civic actions.
- **Geospatial Components**:
  - **Civic Heatmap** (`CivicHeatmap.jsx`): Uses `react-leaflet` to display complaint hotspots across the city.
  - **Location Picker** (`LocationPickerModal.jsx`): Interactive map tool for users to pin the exact coordinates of their complaints.

### ⚙️ Backend (Core Logic)
- **Role-Based Authentication** (`authController.js`): JWT-based login/registration separating logic for Citizens, Ward Officers, and Admins.
- **Complaint Management & Prioritization** (`complaintsController.js`): Full lifecycle management of complaints. Features an Intelligent Prioritization System that scores incoming complaints based on urgency, scope of impact, and recurrence. Includes handling of proof-of-work images (`multer`).
- **Geographic Information System** (`mapController.js`): Integrates with PostGIS for complex geospatial queries, fetching heatmap data for rendering on the frontend.
- **Welfare & Communication modules**: Dedicated routes catering to welfare schemes and integrating interactions with the communication AI agents.

### 🧠 AI & Analytical Microservices
- **Classification Pipeline** (`services/ai-service`): Automatically categorizes and tags raw incoming complaints using Audio, Image, and Text classifiers to assist in preliminary routing.
- **Communication Agent** (`services/communication-ai`): Handles intelligent automated messaging and dynamic prompt generation for communicating back to stakeholders.
- **Machine Learning Vision** (`Feature3/`): A standalone `ml_vision` service containing AI models (`ai_models.py`) intended for in-depth visual assessment (e.g., damage severity verification from photos).
- **Policy & Allocation Engine** (`Feature2/`): High-level data modeling tools, which appear to support future strategic functionality:
  - Causal modeling (`causal_models.py`)
  - Counterfactual forecasting engine (`counterfactual_engine.py`)
  - Strategic resource/policy optimization (`policy_optimizer.py`)
  - Auto-generated resource allocation plans (`user_allocation_plan_...csv`).

## 3. Infrastructure & Deployment
- **Full Dockerization**: The entire application stack is containerized using `docker-compose.yml`. Each microservice and the Node/React apps have individual `Dockerfile`s.
- **Automated Startup Context**: A `docker-entrypoint.sh` script inside the backend ensures the database schema is auto-migrated and potentially backfilled (via scripts like `002_add_user_location.js`) before services start accepting traffic.

---
*Generated based on codebase analysis as of the latest commit.*
