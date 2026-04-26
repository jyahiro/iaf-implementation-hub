import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';

const dataDirectory = path.resolve(process.cwd(), 'platform-data');
const dataFile = path.join(dataDirectory, 'state.json');
const tokenSecret = process.env.IAF_DEV_TOKEN_SECRET ?? 'iaf-dev-secret';

function ensureState() {
  if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory, {recursive: true});
  }
  if (!fs.existsSync(dataFile)) {
    const initial = {
      users: [],
      projects: [],
      artifacts: [],
      serviceRequests: [],
      domainStages: [],
      auditEvents: [],
    };
    fs.writeFileSync(dataFile, JSON.stringify(initial, null, 2), 'utf8');
  }
}

function readState() {
  ensureState();
  return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
}

function writeState(state) {
  fs.writeFileSync(dataFile, JSON.stringify(state, null, 2), 'utf8');
}

function parseBody(request) {
  return new Promise((resolve, reject) => {
    let data = '';
    request.on('data', (chunk) => {
      data += chunk.toString();
    });
    request.on('end', () => {
      if (!data) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(data));
      } catch (error) {
        reject(error);
      }
    });
  });
}

function json(response, status, payload) {
  response.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  });
  response.end(JSON.stringify(payload));
}

function createToken(user) {
  return Buffer.from(`${user.userId}:${user.role}:${tokenSecret}`, 'utf8').toString('base64');
}

function parseToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  try {
    const decoded = Buffer.from(authHeader.replace('Bearer ', ''), 'base64').toString('utf8');
    const [userId, role, secret] = decoded.split(':');
    if (secret !== tokenSecret) {
      return null;
    }
    return {userId, role};
  } catch {
    return null;
  }
}

function requireAuth(request, response) {
  const session = parseToken(request.headers.authorization);
  if (!session) {
    json(response, 401, {error: 'Unauthorized'});
    return null;
  }
  return session;
}

function logAudit(state, eventType, actorId, payload) {
  state.auditEvents.push({
    id: `audit-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    eventType,
    actorId,
    payload,
    timestamp: new Date().toISOString(),
  });
}

const server = http.createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    json(response, 204, {});
    return;
  }

  const url = new URL(request.url ?? '/', 'http://localhost:4100');
  const state = readState();

  if (request.method === 'GET' && url.pathname === '/health') {
    json(response, 200, {
      status: 'ok',
      service: 'iaf-platform-api',
      auth: 'token',
      persistence: dataFile,
    });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/auth/login') {
    try {
      const body = await parseBody(request);
      const email = String(body.email ?? '').trim().toLowerCase();
      const role = String(body.role ?? 'program_manager').trim();
      if (!email) {
        json(response, 400, {error: 'email is required'});
        return;
      }
      let user = state.users.find((candidate) => candidate.email === email);
      if (!user) {
        user = {
          userId: `user-${Date.now()}`,
          email,
          role,
        };
        state.users.push(user);
        logAudit(state, 'user_created', user.userId, {email, role});
      }
      const token = createToken(user);
      writeState(state);
      json(response, 200, {
        token,
        user: {
          userId: user.userId,
          email: user.email,
          role: user.role,
        },
      });
    } catch {
      json(response, 400, {error: 'invalid json payload'});
    }
    return;
  }

  if (request.method === 'GET' && url.pathname === '/projects') {
    const session = requireAuth(request, response);
    if (!session) {
      return;
    }
    const projects = state.projects.filter((project) => project.ownerId === session.userId);
    json(response, 200, {projects});
    return;
  }

  if (request.method === 'POST' && url.pathname === '/projects') {
    const session = requireAuth(request, response);
    if (!session) {
      return;
    }
    try {
      const body = await parseBody(request);
      const name = String(body.name ?? '').trim();
      if (!name) {
        json(response, 400, {error: 'name is required'});
        return;
      }
      const project = {
        id: `project-${Date.now()}`,
        name,
        description: String(body.description ?? ''),
        ownerId: session.userId,
        currentDomain: 'domain-1-framing',
        createdAt: new Date().toISOString(),
      };
      state.projects.push(project);
      state.domainStages.push({
        projectId: project.id,
        domain: 'domain-1-framing',
        checklist: [],
        requiredArtifactTemplateIds: ['template-domain-1-business-problem-brief'],
      });
      logAudit(state, 'project_created', session.userId, {projectId: project.id, name: project.name});
      writeState(state);
      json(response, 201, {project});
    } catch {
      json(response, 400, {error: 'invalid json payload'});
    }
    return;
  }

  if (request.method === 'POST' && url.pathname.match(/^\/projects\/[^/]+\/artifacts$/)) {
    const session = requireAuth(request, response);
    if (!session) {
      return;
    }
    const projectId = url.pathname.split('/')[2];
    try {
      const body = await parseBody(request);
      const artifact = {
        id: `artifact-${Date.now()}`,
        projectId,
        templateId: String(body.templateId ?? ''),
        title: String(body.title ?? 'Untitled Artifact'),
        markdown: String(body.markdown ?? ''),
        status: 'draft',
        ownerId: session.userId,
        version: 1,
        updatedAt: new Date().toISOString(),
      };
      state.artifacts.push(artifact);
      logAudit(state, 'artifact_created', session.userId, {projectId, artifactId: artifact.id});
      writeState(state);
      json(response, 201, {artifact});
    } catch {
      json(response, 400, {error: 'invalid json payload'});
    }
    return;
  }

  if (request.method === 'POST' && url.pathname.match(/^\/projects\/[^/]+\/services$/)) {
    const session = requireAuth(request, response);
    if (!session) {
      return;
    }
    const projectId = url.pathname.split('/')[2];
    try {
      const body = await parseBody(request);
      const requestRecord = {
        id: `service-${Date.now()}`,
        projectId,
        serviceId: String(body.serviceId ?? ''),
        status: 'submitted',
        requestedBy: session.userId,
        createdAt: new Date().toISOString(),
        outputArtifactIds: [],
      };
      state.serviceRequests.push(requestRecord);
      logAudit(state, 'service_requested', session.userId, {
        projectId,
        serviceId: requestRecord.serviceId,
      });
      writeState(state);
      json(response, 201, {serviceRequest: requestRecord});
    } catch {
      json(response, 400, {error: 'invalid json payload'});
    }
    return;
  }

  if (request.method === 'GET' && url.pathname.match(/^\/projects\/[^/]+\/dashboard$/)) {
    const session = requireAuth(request, response);
    if (!session) {
      return;
    }
    const projectId = url.pathname.split('/')[2];
    const project = state.projects.find((candidate) => candidate.id === projectId);
    if (!project) {
      json(response, 404, {error: 'project not found'});
      return;
    }

    const artifacts = state.artifacts.filter((artifact) => artifact.projectId === projectId);
    const serviceRequests = state.serviceRequests.filter((item) => item.projectId === projectId);
    const pendingApprovals = artifacts.filter((artifact) => artifact.status !== 'approved').length;

    json(response, 200, {
      project,
      summary: {
        artifactCount: artifacts.length,
        serviceRequestCount: serviceRequests.length,
        pendingApprovals,
      },
    });
    return;
  }

  if (request.method === 'GET' && url.pathname.match(/^\/projects\/[^/]+\/audit$/)) {
    const session = requireAuth(request, response);
    if (!session) {
      return;
    }
    const projectId = url.pathname.split('/')[2];
    const events = state.auditEvents.filter((event) => event.payload.projectId === projectId || event.payload.projectId === undefined);
    json(response, 200, {events});
    return;
  }

  json(response, 404, {error: 'route not found'});
});

server.listen(4100, () => {
  console.log('IAF platform API listening on http://localhost:4100');
});
