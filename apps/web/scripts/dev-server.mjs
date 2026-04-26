import http from 'node:http';

const apiBaseUrl = process.env.API_BASE_URL ?? 'http://localhost:4100';

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>IAF Platform Web MVP</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 24px; line-height: 1.4; }
    h1, h2 { margin-bottom: 8px; }
    section { border: 1px solid #ddd; border-radius: 8px; padding: 12px; margin-bottom: 16px; }
    input, textarea, select, button { margin: 4px 0; padding: 8px; width: 100%; max-width: 640px; }
    button { width: auto; cursor: pointer; }
    pre { background: #f7f7f7; padding: 12px; border-radius: 6px; overflow: auto; max-height: 300px; }
  </style>
</head>
<body>
  <h1>IAF Platform MVP</h1>
  <p>API base URL: <code>${apiBaseUrl}</code></p>

  <section>
    <h2>1) Login</h2>
    <input id="email" placeholder="user@agency.gov" />
    <select id="role">
      <option value="program_manager">Program Manager</option>
      <option value="analyst">Analyst</option>
      <option value="sponsor">Sponsor</option>
      <option value="data_steward">Data Steward</option>
      <option value="reviewer">Reviewer</option>
      <option value="admin">Admin</option>
    </select>
    <button onclick="login()">Login</button>
  </section>

  <section>
    <h2>2) Create Project</h2>
    <input id="projectName" placeholder="Project name" />
    <textarea id="projectDescription" placeholder="Project description"></textarea>
    <button onclick="createProject()">Create Project</button>
  </section>

  <section>
    <h2>3) Create Artifact</h2>
    <input id="artifactProjectId" placeholder="Project ID" />
    <input id="artifactTemplateId" placeholder="Template ID (e.g., template-domain-1-business-problem-brief)" />
    <input id="artifactTitle" placeholder="Artifact title" />
    <textarea id="artifactMarkdown" placeholder="# Markdown artifact"></textarea>
    <button onclick="createArtifact()">Create Artifact</button>
  </section>

  <section>
    <h2>4) Request Service</h2>
    <input id="serviceProjectId" placeholder="Project ID" />
    <input id="serviceId" placeholder="Service ID (e.g., service-01)" />
    <button onclick="requestService()">Request Service</button>
  </section>

  <section>
    <h2>5) Project Dashboard</h2>
    <input id="dashboardProjectId" placeholder="Project ID" />
    <button onclick="loadDashboard()">Load Dashboard</button>
  </section>

  <section>
    <h2>Response</h2>
    <pre id="output">{}</pre>
  </section>

  <script>
    const apiBaseUrl = ${JSON.stringify(apiBaseUrl)};
    let token = null;

    function show(value) {
      document.getElementById('output').textContent = JSON.stringify(value, null, 2);
    }

    async function request(path, options = {}) {
      const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      };
      if (token) {
        headers.Authorization = 'Bearer ' + token;
      }
      const response = await fetch(apiBaseUrl + path, {
        ...options,
        headers,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }
      return data;
    }

    async function login() {
      try {
        const data = await request('/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: document.getElementById('email').value,
            role: document.getElementById('role').value,
          }),
        });
        token = data.token;
        show(data);
      } catch (error) {
        show({error: error.message});
      }
    }

    async function createProject() {
      try {
        const data = await request('/projects', {
          method: 'POST',
          body: JSON.stringify({
            name: document.getElementById('projectName').value,
            description: document.getElementById('projectDescription').value,
          }),
        });
        show(data);
      } catch (error) {
        show({error: error.message});
      }
    }

    async function createArtifact() {
      try {
        const projectId = document.getElementById('artifactProjectId').value;
        const data = await request('/projects/' + projectId + '/artifacts', {
          method: 'POST',
          body: JSON.stringify({
            templateId: document.getElementById('artifactTemplateId').value,
            title: document.getElementById('artifactTitle').value,
            markdown: document.getElementById('artifactMarkdown').value,
          }),
        });
        show(data);
      } catch (error) {
        show({error: error.message});
      }
    }

    async function requestService() {
      try {
        const projectId = document.getElementById('serviceProjectId').value;
        const data = await request('/projects/' + projectId + '/services', {
          method: 'POST',
          body: JSON.stringify({
            serviceId: document.getElementById('serviceId').value,
          }),
        });
        show(data);
      } catch (error) {
        show({error: error.message});
      }
    }

    async function loadDashboard() {
      try {
        const projectId = document.getElementById('dashboardProjectId').value;
        const data = await request('/projects/' + projectId + '/dashboard');
        show(data);
      } catch (error) {
        show({error: error.message});
      }
    }
  </script>
</body>
</html>`;

const server = http.createServer((_, response) => {
  response.writeHead(200, {'Content-Type': 'text/html'});
  response.end(html);
});

server.listen(4200, () => {
  console.log('IAF platform web MVP listening on http://localhost:4200');
});
