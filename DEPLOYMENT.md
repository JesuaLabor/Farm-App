# 🚀 AgriConnect Cloud Deployment Guide: Render & Cloudflare Pages

This guide walks you through deploying the full **AgriConnect** stack to the cloud using:
- **Render.com**: Hosting the Go REST API backend (Free / Starter Web Service with Docker)
- **MongoDB Atlas**: Free managed cloud database (M0 cluster)
- **Cloudflare Pages**: Hosting the Web App and Mobile PWA (Unlimited bandwidth, global CDN, automated SSL)

---

## 🏗️ Architecture Overview

```
                          ┌──────────────────────────┐
                          │   Cloudflare Pages (CDN)  │
                          ├──────────────────────────┤
                          │  Web App   |  Mobile PWA │
                          └─────────────┬────────────┘
                                        │ HTTPS Requests
                                        ▼ (VITE_API_URL)
                          ┌──────────────────────────┐
                          │     Render.com (API)     │
                          ├──────────────────────────┤
                          │  Go REST API (Docker)    │
                          │  Port: Dynamic ($PORT)   │
                          └─────────────┬────────────┘
                                        │ TLS / SRV
                                        ▼
                          ┌──────────────────────────┐
                          │   MongoDB Atlas Cloud    │
                          ├──────────────────────────┤
                          │ Free M0 Database Cluster │
                          └──────────────────────────┘
```

---

## 📋 Prerequisites

1. A **GitHub** account with this repository pushed.
2. A free **MongoDB Atlas** account: [cloud.mongodb.com](https://cloud.mongodb.com/)
3. A free **Render** account: [render.com](https://render.com/)
4. A free **Cloudflare** account: [dash.cloudflare.com](https://dash.cloudflare.com/)

---

## Step 1: Set Up MongoDB Atlas (Cloud Database)

Render does not include built-in MongoDB storage, so MongoDB Atlas M0 is the recommended free cloud database.

1. Sign in to [MongoDB Atlas](https://cloud.mongodb.com/).
2. Click **Create** to deploy a new database:
   - Select **M0 (Free)** tier.
   - Provider: **AWS** (choose a region close to your users, e.g., Singapore or US East).
   - Click **Create Deployment**.
3. **Set up Database User**:
   - Username: `agriadmin` (or your choice).
   - Password: Click **Autogenerate Secure Password** and copy it somewhere safe.
   - Click **Create Database User**.
4. **Configure Network Access**:
   - Under "Where would you like to connect from?", select **Cloud Environment** or add IP:
   - IP Address: `0.0.0.0/0` (Description: `Allow Render backend`).
   - Click **Add Entry**.
5. **Get your Connection String**:
   - Click **Done** / **Go to Clusters** -> Click **Connect**.
   - Select **Drivers** (Go).
   - Copy the connection string. It will look like:
     ```text
     mongodb+srv://agriadmin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
     ```
   - Replace `<password>` with your actual database user password.

---

## Step 2: Deploy the Backend on Render.com

You have two methods to deploy on Render:

### Method A: 1-Click Blueprint (Recommended)
This repository already includes `render.yaml` configured for zero-hassle deployment.

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "chore: add deployment configuration for Render and Cloudflare"
   git push origin <your-branch>
   ```
2. Log in to [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** (top right) -> **Blueprint**.
4. Select your `Farm-App` repository.
5. Render will automatically detect `render.yaml` and configure:
   - Service Name: `agriconnect-api`
   - Runtime: `Docker` (using `./backend/Dockerfile`)
   - Plan: `Free`
   - Auto-generated `JWT_SECRET`
6. When prompted for `MONGO_URI`, paste your MongoDB Atlas connection string:
   ```text
   mongodb+srv://agriadmin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. Click **Apply**. Render will build the Docker container and start your Go backend!

### Method B: Manual Web Service Setup
If you prefer setting it up manually without blueprints:
1. In Render Dashboard, click **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure the settings:
   - **Name**: `agriconnect-api`
   - **Region**: Singapore (or nearest to your MongoDB Atlas cluster)
   - **Language**: `Docker`
   - **Dockerfile Path**: `./backend/Dockerfile`
   - **Docker Context**: `./backend`
   - **Instance Type**: `Free`
4. Expand **Environment Variables** and add:
   | Variable | Value | Notes |
   |---|---|---|
   | `MONGO_URI` | `mongodb+srv://agriadmin:...` | Your Atlas connection string |
   | `DB_NAME` | `agriconnect` | Database name |
   | `JWT_SECRET` | *(64-char random string)* | Can generate with `openssl rand -hex 32` |
   | `JWT_EXPIRY_HOURS` | `24` | Token lifespan |
   | `UPLOAD_DIR` | `./uploads` | Local upload directory |
5. Click **Deploy Web Service**.

### Verify Backend Deployment
Once deployed, copy your Render service URL (e.g., `https://agriconnect-api.onrender.com`).
Test the health check endpoint in your browser or curl:
```bash
curl https://<your-render-app>.onrender.com/api/health
# Expected Response: {"status":"ok"}
```

---

## Step 3: Deploy the Web App on Cloudflare Pages

1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. On the left sidebar, navigate to **Compute (Workers & Pages)** -> **Pages**.
3. Click **Connect to Git** and authorize your GitHub account.
4. Select your `Farm-App` repository and click **Begin setup**.
5. Configure the build settings for the **Web App**:
   - **Project Name**: `agriconnect-web` (or your preferred name)
   - **Production Branch**: `main` (or `feat/pwa`)
   - **Framework preset**: `Vite`
   - **Root directory**: `web`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
6. Expand **Environment variables** and add:
   - **Variable name**: `VITE_API_URL`
   - **Value**: `https://<your-render-app>.onrender.com` *(do NOT include a trailing slash)*
7. Click **Save and Deploy**.

> Cloudflare Pages will build the Vite project and deploy it with free global CDN and automatic SSL!

---

## Step 4: Deploy the Mobile PWA on Cloudflare Pages

The mobile Progressive Web App (PWA) can be deployed as an independent Cloudflare Pages project for mobile users to install on their devices.

1. In Cloudflare Dashboard, go to **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**.
2. Select your repository again.
3. Configure the build settings for the **Mobile PWA**:
   - **Project Name**: `agriconnect-mobile`
   - **Production Branch**: `main` (or `feat/pwa`)
   - **Framework preset**: `Vite`
   - **Root directory**: `mobile`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Expand **Environment variables** and add:
   - **Variable name**: `VITE_API_URL`
   - **Value**: `https://<your-render-app>.onrender.com` *(same Render backend URL)*
5. Click **Save and Deploy**.

---

## Step 5: Verification & Initial Login

### 1. Test Super Admin Login
When the Go backend connects to MongoDB Atlas for the first time, it automatically initializes the Super Admin account:
- **URL**: Open your Cloudflare Pages Web App URL (`https://agriconnect-web.pages.dev/login`)
- **Email**: `superadmin@agriconnect.gov.ph`
- **Password**: `SuperAdmin123!`

### 2. Test Mobile PWA Installation
1. On your smartphone (Android Chrome or iOS Safari), open your mobile Cloudflare URL (`https://agriconnect-mobile.pages.dev`).
2. Tap **"Install App"** (or in Safari: Share icon -> **"Add to Home Screen"**).
3. The app will install with offline caching (Workbox) and full PWA capabilities.

---

## 🛠️ Key Configuration Files Summary

| File | Location | Purpose |
|---|---|---|
| `render.yaml` | Root `/` | Infrastructure-as-code Blueprint for 1-click Render deployment |
| `Dockerfile` | `/backend/Dockerfile` | Production multi-stage Docker image with CA certificates for Atlas |
| `.dockerignore` | `/backend/.dockerignore` | Keeps Docker image minimal and excludes secrets |
| `_redirects` | `/web/public/_redirects` | Prevents 404 errors on browser refresh in Cloudflare Pages SPAs |
| `_redirects` | `/mobile/public/_redirects` | Prevents 404 errors on browser refresh in Mobile PWA |
