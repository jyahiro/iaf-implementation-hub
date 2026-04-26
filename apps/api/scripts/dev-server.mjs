import http from 'node:http';

const server = http.createServer((_, response) => {
  response.writeHead(200, {'Content-Type': 'application/json'});
  response.end(
    JSON.stringify({
      status: 'ok',
      service: 'iaf-platform-api',
      message: 'Use TypeScript sources in apps/api/src for implementation.',
    }),
  );
});

server.listen(4100, () => {
  console.log('IAF platform API dev shim listening on http://localhost:4100');
});
