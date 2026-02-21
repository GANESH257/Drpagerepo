# Fix Database Connection Timeout

## Problem
Connection timeout means your IP address is **not authorized** to connect to Cloud SQL.

## Solution: Add Your IP to Authorized Networks

### Step 1: Get Your Public IP

```bash
# Run this command to get your IP
curl ifconfig.me
```

Or visit: https://whatismyipaddress.com/

### Step 2: Add IP to Cloud SQL

1. **Go to GCP Console**: https://console.cloud.google.com/sql/instances
2. **Click** on your instance: `aip-database`
3. **Click** "Connections" tab (left sidebar)
4. **Scroll down** to "Authorized networks"
5. **Click** "Add network"
6. **Enter**:
   - **Name**: `My Development Machine` (or any name)
   - **Network**: Paste your IP address (e.g., `123.45.67.89`)
7. **Click** "Save"
8. **Wait** 1-2 minutes for changes to apply

### Step 3: Test Connection

```bash
cd aip-backend
node test-db-connection.js
```

Should see: `✅ SUCCESS: Database connected!`

### Step 4: Start Server

```bash
npm run dev
```

---

## Alternative: Use Cloud SQL Proxy (More Secure)

If you don't want to add your IP, use Cloud SQL Proxy:

### Install Cloud SQL Proxy

```bash
# Download
curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.8.0/cloud-sql-proxy.darwin.arm64

# Make executable
chmod +x cloud-sql-proxy
```

### Run Proxy

```bash
# In one terminal
./cloud-sql-proxy ensemble-portal:us-central1:aip-database

# This will create a local connection on localhost:5432
```

### Update .env

```env
DB_HOST=127.0.0.1
DB_PORT=5432
# Remove SSL since proxy handles it
```

### Update connection.ts

Remove SSL config when using proxy:

```typescript
ssl: false, // Not needed with Cloud SQL Proxy
```

---

## Quick Fix Checklist

- [ ] Got your public IP address
- [ ] Added IP to Cloud SQL authorized networks
- [ ] Waited 1-2 minutes
- [ ] Tested connection: `node test-db-connection.js`
- [ ] Started server: `npm run dev`

---

**Most Common Issue**: IP not in authorized networks. Fix this first.
