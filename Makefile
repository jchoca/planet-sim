build: game.ts types/babylon.d.ts
	tsc
	http-server

setup:
	npm install -g typescript
	npm install -g http-server