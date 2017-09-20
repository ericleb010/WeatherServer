## To build image and container

```bash
docker build --tag="knox/weather-server" .
docker run --name="WeatherServer" --publish=4420:4420 -d weather-server
```

## To run:

1. Ensure Node 6.x or later and NPM are installed.
2. Run `npm install` to load dependencies.
3. Run `node server/server.js` to begin serving content.