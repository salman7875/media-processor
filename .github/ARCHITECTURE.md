# Architecture - Video Clipper

## System Overview

Video Clipper is a Node.js-based microservice that downloads and processes YouTube video segments on demand. The system follows a modular MVC architecture with clear separation of concerns between routing, business logic, utilities, and external process management.

```
┌─────────────────────────────────────────────────────────────┐
│                    Client (Browser)                         │
│                                                             │
│  GET /media?q=https://youtube.com/watch?v=xyz             │
│  GET /media/status/:jobId                                 │
│  GET /public/segment_*.webm (download)                    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Express.js Server                         │
│                      (Port 3000)                            │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │              Routes & Middleware                      │ │
│  │  ├─ media.route.js - API endpoints                  │ │
│  │  ├─ Static middleware - Serve /public/              │ │
│  │  └─ auth-check.middleware.js (scaffolded)           │ │
│  └───────────────────────┬────────────────────────────┘ │
│                          │                               │
│                          ▼                               │
│  ┌──────────────────────────────────────────────────────┐ │
│  │            Business Logic Controllers                 │ │
│  │  ├─ MediaController.fetchVideo()                    │ │
│  │  └─ UserController (scaffolded)                     │ │
│  └───────────────────────┬────────────────────────────┘ │
│                          │                               │
│                          ▼                               │
│  ┌──────────────────────────────────────────────────────┐ │
│  │            Utility Services                          │ │
│  │  ├─ spawn-process.js - Process execution            │ │
│  │  ├─ esm-path.js - Module path utilities             │ │
│  │  └─ (Future: job-queue.js, validator.js, logger.js) │ │
│  └───────────────────────┬────────────────────────────┘ │
│                          │                               │
└──────────────────────────┼───────────────────────────────┘
                           │
                ┌──────────┴───────────┐
                ▼                      ▼
        ┌─────────────────┐   ┌──────────────────┐
        │   File System   │   │  External Tools  │
        │  /segments/     │   │  - yt-dlp        │
        │  /public/       │   │  - ffmpeg        │
        └─────────────────┘   │  - Node.js child │
                              │    processes     │
                              └──────────────────┘
```

---

## Component Architecture

### 1. Entry Points

#### [server/src/server.js](server/src/server.js)

- **Purpose:** Application entry point
- **Responsibilities:**
  - Initialize Express app
  - Start HTTP server on port 3000
  - Handle graceful shutdown
  - Load environment configuration

```javascript
import { app } from "./app.js";
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

#### [server/src/app.js](server/src/app.js)

- **Purpose:** Express application factory
- **Responsibilities:**
  - Setup middleware (body parser, static files, auth)
  - Mount route handlers
  - Configure error handling
  - Return configured app instance

---

### 2. Route Layer

#### [server/src/modules/media/media.route.js](server/src/modules/media/media.route.js)

- **Purpose:** Define media-related API endpoints
- **Routes:**
  - `GET /media` - Fetch video segment
  - (Future) `GET /media/status/:jobId` - Check download status
  - (Future) `POST /media/download` - Start async download

**Responsibility:** Route HTTP requests to appropriate controller methods

---

### 3. Controller Layer

#### [server/src/modules/media/media.controller.js](server/src/modules/media/media.controller.js)

- **Purpose:** Handle video segment download requests
- **Methods:**
  - `fetchVideo(req, res)` - Main request handler
- **Responsibilities:**
  - Validate input parameters
  - Call utility functions to spawn yt-dlp
  - Format and return response to client
  - Handle errors

**Current Limitations:**

- Hardcoded segment duration (0 seconds)
- Doesn't await process completion
- Limited error handling

```javascript
export class MediaController {
  async fetchVideo(req, res) {
    const q = req.query.q;
    // Validate URL
    // Generate filename
    // Spawn yt-dlp process
    // Return download link
  }
}
```

---

### 4. Utility Services

#### [server/src/utils/spawn-process.js](server/src/utils/spawn-process.js)

- **Purpose:** Execute external processes safely
- **Function:** `spawnProcess(args)`
- **Responsibilities:**
  - Spawn child_process with yt-dlp
  - Apply CPU limits
  - Return process handle
  - (Future) Timeout management, process cleanup

```javascript
export function spawnProcess(args) {
  const process = spawn("yt-dlp", args, {
    stdio: ["pipe", "pipe", "pipe"],
    cpuLimit: 80, // CPU usage limit percentage
  });
  return process;
}
```

**Current Issue:** Returns process without waiting for completion, doesn't provide meaningful error handling

#### [server/src/utils/esm-path.js](server/src/utils/esm-path.js)

- **Purpose:** Resolve ESM module paths
- **Functions:**
  - `getESMDirnam(importMetaUrl)` - Get directory path
  - `getESMFilename(importMetaUrl)` - Get file path
- **Responsibilities:**
  - Convert ES Module URLs to file paths
  - Provide `__dirname` equivalent for ESM

---

### 5. Middleware Layer

#### [server/src/middleware/auth-check.middleware.js](server/src/middleware/auth-check.middleware.js)

- **Status:** Scaffolded, empty
- **Future Purpose:** Validate user authentication
- **Responsibilities:**
  - Extract and verify JWT tokens
  - Attach user info to request
  - Return 401 for invalid/missing auth

---

### 6. Configuration Layer

#### [server/src/config/env.js](server/src/config/env.js)

- **Status:** Scaffolded, empty
- **Purpose:** Environment variable management
- **Future:** Load and validate environment settings

#### [server/src/config/db.js](server/src/config/db.js)

- **Status:** Scaffolded, empty
- **Purpose:** Database connection setup
- **Future:** MongoDB/PostgreSQL initialization

---

## Data Flow Diagrams

### Current Flow: Video Download Request

```
Client Request
    │
    ▼
GET /media?q=https://youtube.com/watch?v=xyz
    │
    ▼
media.route.js
    │
    ├─► Parse URL from query string
    │
    ▼
MediaController.fetchVideo()
    │
    ├─► Check if URL exists (minimal validation)
    │
    ├─► Generate random filename
    │   └─► segment_part[0-9].%(ext)s
    │
    ├─► Build yt-dlp arguments array
    │   ├─ -o (output file)
    │   ├─ -S res:1080 (quality)
    │   ├─ --download-sections *00:00:00.00-00:00:00.00 (TIME: HARDCODED 0s)
    │   ├─ --force-keyframes-at-cuts (clean cuts)
    │   └─ YouTube URL
    │
    ├─► spawnProcess(args)
    │   │
    │   └─► child_process.spawn('yt-dlp', args)
    │       ├─► stdout → console.log (Segment 1: ...)
    │       ├─► stderr → console.error (Segment 1 Error: ...)
    │       └─► exit → console.log (Segment 1 done: code X)
    │
    ├─► Return HTML response IMMEDIATELY
    │   └─► <a href="/public/30 SECOND TIMER.webm">Click to download</a>
    │       └─► PROBLEM: File doesn't exist yet!
    │           Process still running in background
    │
    ▼
Client Browser
    │
    └─► Receives download link
        └─► Clicks link
            └─► 404 - File not found
                (Still downloading!)
```

### Future Flow: Improved with Job Tracking

```
Client Request
    ▼
GET /media?q=https://youtube.com/watch?v=xyz&start=0:10&end=0:30
    ▼
MediaController.fetchVideo()
    ├─► Validate URL format
    ├─► Parse timestamps (start: 10s, end: 30s)
    ├─► Create job record { jobId, status: 'pending' }
    ├─► Add to process queue
    │
    ├─► Return job ID to client
    │   └─► { jobId: 'abc123', status: 'pending' }
    │
    ▼
Client polls for status
    │
    GET /media/status/abc123
    │
    ├─► Check job status in memory/DB
    │
    ├─► If 'downloading':
    │   └─► { status: 'downloading', progress: 45% }
    │
    ├─► If 'complete':
    │   └─► { status: 'complete', downloadUrl: '/public/segment_abc123.webm' }
    │
    ▼
Client gets download link when ready
```

---

## Module Dependencies

### Import Graph

```
server.js
  │
  └─► app.js
      │
      ├─► media.route.js
      │   │
      │   └─► MediaController
      │       │
      │       ├─► spawn-process.js
      │       │   └─► child_process (Node.js built-in)
      │       │
      │       └─► esm-path.js
      │           └─► path (Node.js built-in)
      │
      ├─► Static middleware
      │   └─► express.static('./public')
      │
      └─► (Future auth middleware)
          └─► auth-check.middleware.js
```

### External Dependencies

```
Video Clipper App
    │
    ├─► yt-dlp (child_process.spawn)
    │   ├─► YouTube API access
    │   └─► ffmpeg (called by yt-dlp)
    │
    ├─► ffmpeg (called by yt-dlp)
    │   └─► Video codec libraries
    │
    └─► Node.js Built-ins
        ├─ path
        ├─ fs
        ├─ child_process
        └─ http/url
```

---

## File Storage Architecture

```
/segments/
  ├─ segment_part0.webm          (Downloaded video segments)
  ├─ segment_part1.webm
  ├─ segment_part5.webm
  └─ ...

/public/
  ├─ index.html                  (Static assets)
  ├─ style.css
  └─ (Symlink or copy of segments for download)
```

**Current Issue:** Segments downloaded to `/segments/` but response references `/public/`, causing 404s

---

## Request/Response Cycle

### Current GET /media Request

**Request:**

```http
GET /media?q=https://www.youtube.com/watch?v=dQw4w9WgXcQ HTTP/1.1
Host: localhost:3000
```

**Response (Immediate - ⚠️ File not ready yet):**

```html
<a href="http://localhost:3000/public/30 SECOND TIMER.webm" download
  >Click to download</a
>
```

**Problems:**

1. Response returns before file exists
2. Hardcoded filename doesn't match generated file
3. No indication of progress or completion status
4. Client clicking link gets 404

### Improved Response (Proposed)

**Request:**

```http
GET /media?q=https://www.youtube.com/watch?v=dQw4w9WgXcQ&start=10&end=30 HTTP/1.1
Host: localhost:3000
```

**Response:**

```json
{
  "success": true,
  "jobId": "job_1706560800_abc123",
  "status": "downloading",
  "message": "Extracting segment 0:10-0:30",
  "checkStatusUrl": "/media/status/job_1706560800_abc123"
}
```

**Status Check Response:**

```json
{
  "jobId": "job_1706560800_abc123",
  "status": "complete",
  "filename": "segment_1706560800_abc123.webm",
  "downloadUrl": "/public/segment_1706560800_abc123.webm",
  "duration": 20,
  "fileSize": 2048576
}
```

---

## Deployment Architecture

### Docker Container Setup

#### [server/Dockerfile](server/Dockerfile)

```dockerfile
FROM ubuntu:latest

# Install Node.js v22.x
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
RUN apt-get install -y nodejs

# Install media tools
RUN apt-get install -y ffmpeg yt-dlp

# Setup app
WORKDIR /home/app
COPY . .
RUN npm install

# Start with nodemon (development)
CMD ["nodemon", "src/server.js"]
```

#### [server/docker-compose.yml](server/docker-compose.yml)

```yaml
version: "3.8"
services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - .:/home/app
    restart: unless-stopped
    environment:
      - NODE_ENV=development
```

### Running the Application

**Development (with auto-reload):**

```bash
cd server
docker-compose up
# Accessible at http://localhost:3000
```

**Production (with PM2):**

```bash
npm install pm2 -g
pm2 start ecosystem.config.js
pm2 logs app
```

---

## Database Architecture (Future)

### Currently

- **Status:** No database (stateless)
- **Data Persistence:** None

### Phase 2 - Planned

```
Application Server
    │
    ├─► Redis Cache
    │   ├─ Session storage
    │   ├─ Job queue
    │   └─ Download cache
    │
    └─► MongoDB/PostgreSQL
        ├─ Users table
        │   └─ id, email, password_hash, created_at
        │
        ├─ Downloads table
        │   └─ id, user_id, youtube_url, timestamps, created_at, file_path
        │
        └─ Jobs table
            └─ id, user_id, status, progress, created_at, completed_at
```

---

## Security Architecture

### Current State

- ⚠️ No authentication
- ⚠️ No input validation
- ⚠️ No rate limiting
- ⚠️ No HTTPS

### Planned Security Layers

```
Client Request
    │
    ▼
HTTPS/TLS Layer
    │
    ▼
Helmet Security Headers
    │
    ├─ X-Frame-Options
    ├─ X-Content-Type-Options
    └─ Content-Security-Policy
    │
    ▼
Rate Limiter
    │
    ├─ 100 requests/minute per IP
    └─ 10 downloads/hour per user
    │
    ▼
Input Validator
    │
    ├─ YouTube URL validation
    ├─ Timestamp range validation
    └─ Parameter type checking
    │
    ▼
Authentication Middleware
    │
    ├─ JWT token verification
    └─ User context attachment
    │
    ▼
Authorization Checks
    │
    ├─ User quota validation
    └─ Allowed domains check
    │
    ▼
Business Logic (Controller)
```

---

## Scalability Architecture

### Single Instance (Current)

```
Client Requests → Load Balancer
                      │
                      ▼
                  Node.js Server (Port 3000)
                      │
                  File System Storage
```

### Multi-Instance (Proposed)

```
Client Requests → Load Balancer (nginx)
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
    Instance 1   Instance 2   Instance 3
   (Port 3000)  (Port 3001)  (Port 3002)
        │             │             │
        └─────────────┼─────────────┘
                      │
              ┌───────┴────────┐
              ▼                ▼
          Shared Storage   Redis Cache
          (NFS/S3)        (Sessions, Jobs, Cache)
              │                │
              ▼                ▼
          Database (MongoDB/PostgreSQL)
```

---

## Performance Considerations

### Current Bottlenecks

- No caching - every request re-downloads video
- Synchronous filename generation creates collision risk
- No connection pooling
- No compression on responses

### Performance Targets

- API response < 200ms
- Segment download < 60 seconds
- Support 10+ concurrent downloads
- Handle videos up to 2 hours

### Optimization Strategies

1. **Caching:** Redis for downloaded segments
2. **Compression:** gzip responses
3. **CDN:** Serve segments from edge
4. **Job Queue:** Prioritize and batch downloads
5. **Connection Pooling:** Database connections
6. **Indexing:** Database query optimization

---

## Error Handling Strategy

### Current

- Minimal validation
- Process errors printed to console
- No error responses to client

### Proposed Three-Layer Approach

```
Layer 1: Validation (Early)
    ├─ URL validation
    ├─ Parameter validation
    └─ Return 400 for invalid input

Layer 2: Process Handling (During)
    ├─ Process timeout (300 seconds)
    ├─ Process error capture
    ├─ Resource limits
    └─ Return 500 for processing errors

Layer 3: Recovery (After)
    ├─ Retry logic (exponential backoff)
    ├─ Circuit breaker for repeated failures
    ├─ Fallback behavior
    └─ Return 503 if service degraded
```

---

## Monitoring & Logging

### Current

- Console.log only
- No structured logging
- No metrics collection

### Planned

```
Application Server
    │
    ├─► Winston Logger
    │   ├─ Request/response logging
    │   ├─ Error logging with stack traces
    │   └─ Performance metrics
    │
    ├─► Prometheus Metrics
    │   ├─ Request count/duration
    │   ├─ Download success rate
    │   ├─ Process resource usage
    │   └─ Error rate tracking
    │
    └─► Grafana Dashboard
        ├─ Real-time metrics
        ├─ Historical trends
        └─ Alert triggers
```

---

## Architecture Decision Records (ADRs)

### ADR-001: ES Modules over CommonJS

- **Decision:** Use ES Modules (`import`/`export`)
- **Rationale:** Modern standard, better tree-shaking, clearer dependencies
- **Trade-off:** Requires Node.js 14.8+, more complex path handling

### ADR-002: MVC Pattern for Organization

- **Decision:** Separate routes, controllers, utilities
- **Rationale:** Clear separation of concerns, easier to test, familiar to developers
- **Trade-off:** More files, some duplication in small projects

### ADR-003: Child Process for yt-dlp

- **Decision:** Spawn external yt-dlp process instead of using Node library
- **Rationale:** yt-dlp frequently updated, complex dependencies, better isolation
- **Trade-off:** Process management complexity, system dependency

### ADR-004: File System Storage (Phase 1)

- **Decision:** Store segments on local file system
- **Rationale:** Simple, no additional dependencies, sufficient for MVP
- **Trade-off:** Not scalable, no distributed access, no redundancy

---

## Technology Stack Summary

| Layer                 | Technology         | Version  | Purpose                |
| --------------------- | ------------------ | -------- | ---------------------- |
| **Runtime**           | Node.js            | 22.x     | JavaScript execution   |
| **Web Framework**     | Express.js         | 5.1.0    | HTTP server            |
| **Module System**     | ES Modules         | Native   | Code organization      |
| **Process Execution** | child_process      | Built-in | Spawn yt-dlp           |
| **Video Downloading** | yt-dlp             | Latest   | YouTube download       |
| **Video Processing**  | ffmpeg             | Latest   | Video codec handling   |
| **Development**       | nodemon            | 3.1.10   | Auto-reload during dev |
| **Testing**           | Autocannon         | 8.0.0    | Load testing           |
| **(Future) Caching**  | Redis              | TBD      | Session/cache store    |
| **(Future) Database** | MongoDB/PostgreSQL | TBD      | Persistent storage     |
| **(Future) Logging**  | Winston            | TBD      | Structured logging     |

---

## Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations run
- [ ] Redis cache initialized
- [ ] SSL/TLS certificates installed
- [ ] Firewall rules configured (port 3000)
- [ ] Monitoring and logging set up
- [ ] Backup strategy implemented
- [ ] Health check endpoints configured
- [ ] PM2 process manager set up
- [ ] Log rotation configured
- [ ] Rate limiting thresholds set
- [ ] Error alerting configured

---

**Last Updated:** January 29, 2026  
**Architecture Version:** 1.0 (MVP)  
**Next Review:** After Phase 1 completion
