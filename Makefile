dev:
	cd server && go run ./cmd/server & \
	cd app && npm run dev

build:
	cd app && npm ci && npm run build
	# Clean old dist and move new React build
	rm -rf dist && mkdir dist
	mv app/dist dist/dist
	# Build Go binary
	cd server && go build -o ../dist/app /cmd/server/main.go
