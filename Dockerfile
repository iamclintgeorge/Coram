# --- STAGE 1: Build the React Frontend ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app
# Copy package files first to leverage Docker caching
COPY app/package*.json ./
RUN npm install
# Copy the rest of the frontend code and build
COPY app/ .
RUN npm run build

# --- STAGE 2: Build the Go Backend ---
FROM golang:1.24-alpine AS backend-builder
WORKDIR /server
# Install git/build-base if you have CGO dependencies (SQLite usually needs it)
RUN apk add --no-cache git gcc musl-dev
COPY server/go.mod server/go.sum ./
RUN go mod download
# Copy the rest of the backend code
COPY server/ .
# Build the binary. -o app names the output 'app'
RUN go build -o /coram-app ./cmd/server/main.go

# --- STAGE 3: Final Production Image ---
FROM alpine:latest
RUN apk add --no-cache ca-certificates
WORKDIR /root/

# Copy the compiled binary from Stage 2
COPY --from=backend-builder /coram-app .
# Copy the React 'dist' folder from Stage 1 into a 'dist' folder here
COPY --from=frontend-builder /app/dist ./dist

# Set environment variables (Go can read these)
ENV proxmoxHost 127.0.0.1
ENV proxmoxPort 8006
ENV apiToken "sdf"
ENV mode PROD

# Expose the port Coram runs on
EXPOSE 8080

# Run the application
CMD ["./coram-app"]

