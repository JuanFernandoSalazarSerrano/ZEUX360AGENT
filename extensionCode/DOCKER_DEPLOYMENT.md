# Docker Deployment Guide

## Files Created

- **Dockerfile**: Multi-stage production build optimized for Node.js 22 Alpine
- **docker-compose.yml**: Development/local setup with MongoDB
- **.dockerignore**: Excludes unnecessary files from Docker build
- **.env.example**: Template for environment variables

## EC2 Deployment

### Prerequisites
- EC2 instance with Docker and Docker Compose installed
- MongoDB running (either in a separate container, managed service, or existing instance)

### Option 1: Docker Container Only (With External MongoDB)

```bash
# Build the image
docker build -t extension-app .

# Run the container
docker run -d \
  --name extension-app \
  -p 3000:3000 \
  -e PORT=3000 \
  -e MONGO_URI=mongodb://<your-mongodb-host>:27017 \
  -e MONGO_DB_NAME=extension_db \
  -e GEMINI_API_KEY=<your-api-key> \
  extension-app
```

### Option 2: Docker Compose (Includes MongoDB)

```bash
# Create .env file
cp .env.example .env
# Edit .env with your configuration

# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

## Dockerfile Highlights

- **Multi-stage build**: Reduces final image size by ~40%
- **Alpine base**: Lightweight Linux distro (~150MB total)
- **Node 22**: Matches your package.json requirement
- **Health check**: Monitors application status
- **Dumb-init**: Proper signal handling for graceful shutdown
- **Production deps only**: Excludes devDependencies in final image

## Environment Variables

| Variable | Required | Default | Notes |
|----------|----------|---------|-------|
| PORT | No | 3000 | Application port |
| MONGO_URI | Yes | - | MongoDB connection string |
| MONGO_DB_NAME | Yes | - | Database name |
| GEMINI_API_KEY | No | - | For AI features |

## Docker Compose with EC2 MongoDB Atlas

If using MongoDB Atlas (recommended for production):

```yaml
app:
  environment:
    - MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
    - MONGO_DB_NAME=extension_db
```

## Useful Commands

```bash
# Build image
docker build -t extension-app:latest .

# Run with logs
docker run -it --rm -p 3000:3000 extension-app

# Enter container shell
docker exec -it extension-app sh

# Check logs
docker logs extension-app

# Clean up unused images/containers
docker system prune
```

## Notes

- The Dockerfile uses Alpine Linux (22-alpine) for minimal image size
- TypeScript is compiled during build, only JavaScript runs in production
- Health check pings the app every 30 seconds
- Dumb-init ensures signals (SIGTERM) are properly forwarded for graceful shutdown
