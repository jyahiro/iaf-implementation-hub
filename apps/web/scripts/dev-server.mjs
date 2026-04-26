import http from 'node:http';

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>IAF Platform Web</title>
</head>
<body>
  <h1>IAF Platform Web MVP Shell</h1>
  <p>This is a lightweight shell. Product workflow logic is modeled in <code>apps/web/src/platformShell.ts</code>.</p>
</body>
</html>`;

const server = http.createServer((_, response) => {
  response.writeHead(200, {'Content-Type': 'text/html'});
  response.end(html);
});

server.listen(4200, () => {
  console.log('IAF platform web dev shim listening on http://localhost:4200');
});
