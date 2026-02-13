# Feature Requirements - Video Clipper

## Current Implementation Status

### ✅ Implemented Features

#### 1. Video Download from YouTube

- **Status:** Implemented
- **Description:** Users can provide YouTube URL and trigger video download
- **Endpoint:** `GET /media?q=<youtube_url>`
- **Current Limitations:**
  - Segment duration hardcoded to 0 seconds
  - No timestamp parameters
  - Download starts but doesn't wait for completion

#### 2. Quality Selection (1080p)

- **Status:** Implemented
- **Description:** Videos downloaded at 1080p maximum resolution
- **Code:** `-S res:1080` parameter in yt-dlp command
- **Limitations:**
  - No user choice between quality levels
  - Hardcoded to 1080p only

#### 3. Keyframe-based Segment Cutting

- **Status:** Implemented
- **Description:** Forces cuts at keyframes for clean segment boundaries
- **Code:** `--force-keyframes-at-cuts` parameter
- **Benefit:** Cleaner segment cuts without corrupted frames

#### 4. HTTP Segment Serving

- **Status:** Implemented
- **Description:** Downloaded segments served via HTTP for download
- **Endpoint:** `GET /public/<filename>`
- **Limitations:**
  - Filename mismatch between generated and served
  - No file existence verification

#### 5. Static File Serving

- **Status:** Implemented
- **Description:** Express static middleware serves public assets
- **Directory:** `public/`
- **Use:** Serves downloaded video segments and static content

#### 6. Process Management with CPU Limiting

- **Status:** Partially Implemented
- **Description:** Spawns external processes for video processing
- **Code:** Custom `spawnProcess` utility in [spawn-process.js](server/src/utils/spawn-process.js)
- **Limitations:**
  - CPU limits defined but not enforced
  - No process termination mechanism
  - No timeout protection

#### 7. Error Response for Missing URL

- **Status:** Implemented
- **Description:** Returns 400 error if YouTube URL not provided
- **Code:** Basic validation in [media.controller.js](server/src/modules/media/media.controller.js)
- **Limitations:**
  - Only checks if parameter exists
  - No URL format validation

---

## 🔄 In-Development Features

### 1. Timestamp-based Segment Extraction

- **Priority:** CRITICAL
- **Status:** Needs Implementation
- **Description:** Allow users to specify start and end timestamps for segment
- **Required Parameters:**
  - `start` - Segment start time (format: HH:MM:SS or seconds)
  - `end` - Segment end time (format: HH:MM:SS or seconds)
- **Example Request:**
  ```
  GET /media?q=https://youtube.com/watch?v=xyz&start=0:30&end=1:00
  ```
- **Implementation Steps:**
  1. Parse timestamp parameters from query string
  2. Validate timestamp format and ranges
  3. Calculate duration
  4. Pass to yt-dlp `--download-sections` parameter
  5. Return success/failure to client
- **Related Issue:** ISSUES.md #1

### 2. Process Completion Tracking

- **Priority:** CRITICAL
- **Status:** Needs Implementation
- **Description:** Client needs to know when download completes
- **Options:**
  - Option A: Wait for completion before responding (blocking)
  - Option B: Return job ID, implement polling endpoint
  - Option C: WebSocket real-time updates
- **Recommended:** Option B (non-blocking with polling)
- **Implementation:**
  - Store job status in memory/database
  - Return job ID to client
  - Implement `GET /media/status/:jobId` endpoint
- **Response Example:**
  ```json
  {
    "jobId": "abc123",
    "status": "downloading",
    "progress": 45,
    "estimatedTime": 120
  }
  ```
- **Related Issue:** ISSUES.md #2

### 3. Filename Resolution and Tracking

- **Priority:** CRITICAL
- **Status:** Needs Implementation
- **Description:** Ensure downloaded filename matches response link
- **Current Problem:** Hardcoded "30 SECOND TIMER.webm" doesn't exist
- **Solution:**
  - Capture actual filename from yt-dlp output
  - Store filename in job tracking
  - Return accurate download link
  - Add file existence check before sending response
- **Related Issue:** ISSUES.md #3

---

## 🎯 Planned Features (Phase 2)

### 1. User Authentication

- **Priority:** HIGH
- **Scope:** User accounts, login, API key generation
- **Implementation:** JWT tokens, user database
- **Required for:**
  - Download history tracking
  - Usage quotas per user
  - Access control

### 2. Download History

- **Priority:** HIGH
- **Scope:** Track user's downloaded segments
- **Features:**
  - List previous downloads with timestamps
  - Quick re-download of common segments
  - Download statistics
- **Database:** User downloads table with metadata

### 3. Multiple Output Formats

- **Priority:** MEDIUM
- **Scope:** Support for different video codecs and resolutions
- **Options:**
  - Video formats: MP4, WebM, MKV, AVI
  - Resolutions: 480p, 720p, 1080p, 4K
  - Audio only extraction
- **Implementation:** ffmpeg post-processing pipeline

### 4. Quality Selection Interface

- **Priority:** MEDIUM
- **Scope:** Allow users to choose output quality
- **Parameter:** `?quality=720p` or quality selection form
- **Database:** Store user preferences

### 5. Batch Processing

- **Priority:** MEDIUM
- **Scope:** Download multiple segments in one request
- **Request Format:**
  ```json
  {
    "url": "https://youtube.com/...",
    "segments": [
      { "start": "0:10", "end": "0:20" },
      { "start": "1:00", "end": "1:30" }
    ]
  }
  ```
- **Output:** ZIP file with all segments

### 6. Caching Layer

- **Priority:** MEDIUM
- **Scope:** Cache downloaded videos and segments
- **Implementation:** Redis caching
- **Benefits:**
  - Faster re-downloads of same content
  - Reduced bandwidth usage
  - Better performance under load

### 7. API Documentation

- **Priority:** HIGH
- **Scope:** Swagger/OpenAPI specification
- **Includes:**
  - Endpoint documentation
  - Request/response examples
  - Error code definitions
  - Swagger UI for testing

### 8. Admin Dashboard

- **Priority:** LOW
- **Scope:** Monitoring and management interface
- **Features:**
  - Server statistics
  - Active downloads
  - System health
  - User management

---

## 🚀 Long-term Features (Phase 3+)

### 1. Additional Platform Support

- Support for other video platforms (Vimeo, TikTok, etc.)
- Generic video URL handler
- Platform-specific optimizations

### 2. Real-time Processing Updates

- WebSocket connections for real-time progress
- Live download percentage updates
- ETA calculations

### 3. Advanced Video Processing

- Video trimming and cropping
- Overlay support
- Audio extraction and processing
- Video compression options

### 4. Webhooks

- Notify external systems on download completion
- Integration with workflow automation

### 5. CLI Tool

- Command-line interface for batch downloads
- Scripting support
- Automation friendly

### 6. Mobile App

- Native iOS/Android applications
- Download management on mobile
- Offline segment playback

### 7. Machine Learning Features

- Auto-detect interesting segments
- Scene detection
- Highlight extraction from longer videos

---

## Feature Requirements by Priority

| Feature                     | Priority    | Phase | Effort | Status  |
| --------------------------- | ----------- | ----- | ------ | ------- |
| Timestamp Parameters        | 🔴 CRITICAL | 1     | 2h     | ❌ Todo |
| Process Completion Tracking | 🔴 CRITICAL | 1     | 4h     | ❌ Todo |
| Filename Resolution         | 🔴 CRITICAL | 1     | 2h     | ❌ Todo |
| Input Validation            | 🟠 HIGH     | 1     | 3h     | ❌ Todo |
| Error Handling              | 🟠 HIGH     | 1     | 4h     | ❌ Todo |
| API Documentation           | 🟠 HIGH     | 2     | 6h     | ❌ Todo |
| User Authentication         | 🟠 HIGH     | 2     | 8h     | ❌ Todo |
| Download History            | 🟠 HIGH     | 2     | 6h     | ❌ Todo |
| Multiple Output Formats     | 🟡 MEDIUM   | 2     | 12h    | ❌ Todo |
| Quality Selection           | 🟡 MEDIUM   | 2     | 4h     | ❌ Todo |
| Batch Processing            | 🟡 MEDIUM   | 2     | 8h     | ❌ Todo |
| Caching Layer               | 🟡 MEDIUM   | 2     | 6h     | ❌ Todo |
| Admin Dashboard             | 🟢 LOW      | 3     | 10h    | ❌ Todo |
| WebSocket Updates           | 🟢 LOW      | 3     | 8h     | ❌ Todo |

---

## User Stories

### Phase 1 - MVP User Stories

#### US-001: Download Video Segment

```
As a user,
I want to download a specific segment of a YouTube video,
So that I can get only the part I need without downloading the full video.

Acceptance Criteria:
- I can provide a YouTube URL
- I can specify start and end timestamps
- System downloads the segment
- I receive a download link
- Download link is valid and file exists
```

#### US-002: Track Download Progress

```
As a user,
I want to see the download progress,
So that I know how long to wait and when my file will be ready.

Acceptance Criteria:
- System returns a job ID
- I can poll for status updates
- Status includes percentage complete and ETA
- I'm notified when download completes
- Download link provided upon completion
```

#### US-003: Handle Download Errors

```
As a user,
I want clear error messages when something goes wrong,
So that I can troubleshoot or try a different video.

Acceptance Criteria:
- Invalid URLs are rejected with clear message
- Network errors are handled gracefully
- Timeout errors are communicated
- Server errors don't crash the application
```

### Phase 2 - Enhancement User Stories

#### US-004: Choose Output Quality

```
As a user,
I want to choose the output video quality,
So that I can trade off file size vs quality based on my needs.

Acceptance Criteria:
- I can select from available resolutions
- Selected quality is applied to output
- Different formats are supported
```

#### US-005: View Download History

```
As a user,
I want to see my previous downloads,
So that I can re-download or find segments I've previously created.

Acceptance Criteria:
- I can see list of my past downloads
- Each entry shows URL, timestamps, date
- I can quickly re-download segments
```

---

## Feature Acceptance Tests

### Timestamp Extraction Test

```
GIVEN a user requests /media with YouTube URL and timestamps
WHEN start=00:10&end=00:30 is provided
THEN the system should extract 20-second segment
AND the downloaded file should be exactly 20 seconds long
```

### Error Handling Test

```
GIVEN a user requests /media with invalid URL
WHEN the URL is not a valid YouTube link
THEN the system should return 400 error
AND the error message should indicate invalid URL
AND no download should be attempted
```

### Concurrent Download Test

```
GIVEN multiple users request downloads simultaneously
WHEN 10 concurrent requests are made
THEN each should download without interference
AND no filename collisions occur
AND all jobs complete successfully
```

---

## Non-Functional Requirements

### Performance

- Segment download should complete within 60 seconds for typical videos
- API response time < 200ms for non-download endpoints
- Support at least 10 concurrent downloads
- Handle videos up to 2 hours in duration

### Reliability

- 99.5% uptime target
- Graceful degradation under load
- Automatic recovery from transient failures
- No data loss on crashes

### Security

- Validate all user input
- Rate limiting to prevent abuse
- HTTPS support
- No exposure of system paths in errors

### Scalability

- Horizontal scaling support
- Load balancing ready
- Database connection pooling
- CDN-ready for serving segments

### Maintainability

- 80%+ test coverage
- Clear, documented code
- Modular architecture
- Easy to deploy and update

---

**Last Updated:** January 29, 2026  
**Next Review:** After Phase 1 completion
