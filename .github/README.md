# Video Clipper - Extract YouTube Video Segments

A lightweight Node.js service for downloading and extracting specific segments from YouTube videos.

## Quick Start

### Prerequisites

- Docker & Docker Compose (recommended)
- Or: Node.js 22.x, ffmpeg, yt-dlp

### Run with Docker (Easiest)

```bash
cd server
docker-compose up
```

Visit: http://localhost:3000

### Run Locally

```bash
cd server
npm install
npm run dev
```

## Usage

### Download a Video Segment

**Request:**

```bash
curl "http://localhost:3000/media?q=https://www.youtube.com/watch?v=dQw4w9WgXcQ"
```

**Response:**

```html
<a href="http://localhost:3000/public/30 SECOND TIMER.webm" download
  >Click to download</a
>
```

### File Structure

```
video-clipper/
├── SCOPE.md                    # Project goals and features
├── ISSUES.md                   # Known issues and bugs
├── PR-GUIDELINES.md            # Contribution guidelines
├── FEATURE-REQUIREMENTS.md     # Feature roadmap
├── ARCHITECTURE.md             # System design
├── README.md                   # This file
│
└── server/
    ├── src/
    │   ├── app.js              # Express setup
    │   ├── server.js           # Entry point
    │   │
    │   ├── config/             # Configuration
    │   │   ├── env.js
    │   │   └── db.js
    │   │
    │   ├── modules/            # Feature modules
    │   │   ├── media/
    │   │   │   ├── index.js
    │   │   │   ├── media.controller.js
    │   │   │   └── media.route.js
    │   │   └── user/           # (Scaffolded)
    │   │
    │   ├── middleware/         # Express middleware
    │   │   └── auth-check.middleware.js
    │   │
    │   ├── utils/              # Shared utilities
    │   │   ├── esm-path.js
    │   │   └── spawn-process.js
    │   │
    │   └── segments/           # Downloaded segments
    │
    ├── public/                 # Static files
    ├── test/
    │   ├── load/              # Load testing
    │   │   └── media-download.js
    │   └── unit/              # Unit tests (empty)
    │
    ├── Dockerfile             # Docker image definition
    ├── docker-compose.yml     # Docker Compose setup
    ├── ecosystem.config.js    # PM2 configuration
    ├── package.json
    └── README.md
```

## Available Commands

```bash
# Development
npm run dev           # Start with auto-reload (nodemon)

# Testing
npm test              # Run all tests
npm run test:media    # Run load test (Autocannon)

# Production
npm start             # Start server
```

## Project Documentation

- **[SCOPE.md](SCOPE.md)** - Project goals, vision, target users, and feature scope
- **[ISSUES.md](ISSUES.md)** - Known bugs, fixes needed (critical, high, medium priority)
- **[FEATURE-REQUIREMENTS.md](FEATURE-REQUIREMENTS.md)** - Implemented and planned features
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design, data flow, component details
- **[PR-GUIDELINES.md](PR-GUIDELINES.md)** - Contribution standards and processes

## Key Features

✅ **Implemented:**

- YouTube video segment downloading
- 1080p quality support
- Keyframe-based cutting for clean segments
- HTTP segment serving
- Static file serving

⚠️ **In Development:**

- Timestamp-based segment extraction
- Process completion tracking
- Error handling improvements

🔄 **Planned (Phase 2):**

- User authentication
- Download history
- Multiple output formats
- Batch processing
- Caching layer
- Admin dashboard

## Known Issues

**Critical Issues (Blocking):**

1. Segment duration hardcoded to 0 seconds - see [ISSUES.md #1](ISSUES.md#1-hardcoded-segment-duration)
2. Process doesn't wait for completion - see [ISSUES.md #2](ISSUES.md#2-process-spawning-doesnt-wait-for-completion)
3. Hardcoded response filename - see [ISSUES.md #3](ISSUES.md#3-hardcoded-response-filename)

See [ISSUES.md](ISSUES.md) for complete list (16 issues tracked).

## Technology Stack

- **Runtime:** Node.js 22.x
- **Framework:** Express.js 5.1.0
- **Module System:** ES Modules
- **External:** yt-dlp, ffmpeg
- **Deployment:** Docker, Docker Compose
- **Process Management:** PM2 (config ready)
- **Development:** nodemon, Autocannon

## Contributing

Read [PR-GUIDELINES.md](PR-GUIDELINES.md) for:

- Code standards and conventions
- Commit message format
- Pull request process
- Testing requirements
- Review guidelines

Quick summary:

1. Follow ES Module conventions
2. Use camelCase for functions, PascalCase for classes
3. Add JSDoc comments for public functions
4. Write tests for new features
5. Use Conventional Commits format

## System Architecture

```
Client Browser
    │
    ├─ GET /media?q=<youtube_url>      (Request segment)
    ├─ GET /media/status/:jobId         (Check progress)
    └─ GET /public/<filename>.webm      (Download)
    │
    ▼
Express.js Server (Port 3000)
    │
    ├─ Routes (media.route.js)
    ├─ Controllers (media.controller.js)
    ├─ Utilities (spawn-process.js, esm-path.js)
    └─ Middleware (auth, static files)
    │
    ▼
External Processes
    │
    ├─ yt-dlp (video download)
    └─ ffmpeg (video processing)
    │
    ▼
File Storage
    │
    ├─ /segments/ (Downloaded videos)
    └─ /public/   (Served files)
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed diagrams and component descriptions.

## Environment Configuration

Create `.env` file (future):

```env
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
MAX_DOWNLOAD_TIME=600
MAX_FILE_SIZE=2GB
```

Current: All settings hardcoded (see [ISSUES.md #12](ISSUES.md#12-hardcoded-server-configuration))

## Docker Deployment

### Build

```bash
cd server
docker build -t video-clipper:latest .
```

### Run

```bash
docker run -p 3000:3000 -v $(pwd)/segments:/home/app/segments video-clipper
```

### Docker Compose

```bash
cd server
docker-compose up -d
```

## Testing

### Load Test

```bash
cd server
npm run test:media
```

Runs 10 concurrent connections for 10 seconds using Autocannon.

### Unit Tests

Currently: No unit tests (test/unit/ is empty)

Planned: Jest/Mocha framework with 80%+ coverage

## Performance

### Targets

- Segment download: < 60 seconds
- API response: < 200ms
- Concurrent downloads: 10+
- Video support: Up to 2 hours

### Current Bottlenecks

- No caching
- File system storage only
- Single instance only
- No database optimization

## Security

### Current

⚠️ Minimal - suitable for development only

- No authentication
- No input validation
- No rate limiting
- No HTTPS

### Planned (Phase 2)

- JWT authentication
- Input validation & sanitization
- Rate limiting per IP/user
- HTTPS/TLS
- Helmet security headers
- CORS configuration

## API Endpoints

### Current

| Method | Endpoint         | Description      | Status       |
| ------ | ---------------- | ---------------- | ------------ |
| GET    | `/media?q=<url>` | Download segment | ⚠️ Hardcoded |
| GET    | `/public/<file>` | Download file    | ✅ Working   |

### Planned (Phase 2)

| Method | Endpoint               | Description           |
| ------ | ---------------------- | --------------------- |
| POST   | `/media`               | Start async download  |
| GET    | `/media/status/:jobId` | Check download status |
| GET    | `/media/history`       | User download history |
| DELETE | `/media/:jobId`        | Cancel download       |

## Troubleshooting

### 404 on download link

- Process still downloading
- Check process status first (planned feature)
- See [ISSUES.md #2](ISSUES.md#2-process-spawning-doesnt-wait-for-completion)

### No file downloaded

- Segment duration is 0 seconds (hardcoded)
- Use longer video URLs for testing
- See [ISSUES.md #1](ISSUES.md#1-hardcoded-segment-duration)

### Process hangs

- No timeout protection (planned)
- Manually stop container and restart
- See [ISSUES.md #7](ISSUES.md#7-missing-process-cleanup-and-timeouts)

## Roadmap

### Phase 1 (Current - MVP)

- [ ] Fix critical bugs (#1, #2, #3)
- [ ] Add timestamp parameters
- [ ] Implement error handling
- [ ] Complete input validation

### Phase 2 (Enhancement)

- [ ] User authentication
- [ ] Database integration
- [ ] API documentation (Swagger)
- [ ] Download history
- [ ] Multiple output formats
- [ ] Caching layer (Redis)

### Phase 3 (Scale)

- [ ] Batch processing
- [ ] Webhooks
- [ ] Real-time updates (WebSocket)
- [ ] Admin dashboard
- [ ] Analytics & monitoring

## Support & Issues

- **Report Bugs:** Check [ISSUES.md](ISSUES.md) first, then open GitHub issue
- **Feature Requests:** See [FEATURE-REQUIREMENTS.md](FEATURE-REQUIREMENTS.md)
- **Questions:** Read [ARCHITECTURE.md](ARCHITECTURE.md) for system design
- **Contributing:** See [PR-GUIDELINES.md](PR-GUIDELINES.md)

## License

MIT (update as needed)

## Maintainers

- Project Team

---

**Last Updated:** January 29, 2026

For detailed information, see:

- Project scope: [SCOPE.md](SCOPE.md)
- Known issues: [ISSUES.md](ISSUES.md)
- Architecture: [ARCHITECTURE.md](ARCHITECTURE.md)
- Feature roadmap: [FEATURE-REQUIREMENTS.md](FEATURE-REQUIREMENTS.md)
- How to contribute: [PR-GUIDELINES.md](PR-GUIDELINES.md)
