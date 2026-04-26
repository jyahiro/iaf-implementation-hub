import type {Artifact, StorageProvider} from '@iaf/shared';

function artifactPath(projectId: string, artifactId: string): string {
  return `platform-data/projects/${projectId}/artifacts/${artifactId}.md`;
}

export class ArtifactService {
  constructor(private readonly storage: StorageProvider) {}

  async saveArtifact(artifact: Artifact): Promise<Artifact> {
    const path = artifactPath(artifact.projectId, artifact.id);
    await this.storage.write(path, artifact.markdown);
    return {
      ...artifact,
      updatedAt: new Date().toISOString(),
      version: artifact.version + 1,
    };
  }

  async loadArtifact(projectId: string, artifactId: string): Promise<string> {
    return this.storage.read(artifactPath(projectId, artifactId));
  }
}
