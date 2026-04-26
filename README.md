# Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## Features

- **Static Site Generator**: Efficient and fast content building.
- **Live Reload**: Reflects changes immediately during local development.
- **GitHub Pages Integration**: Easily deploy to GitHub Pages.

## Getting Started

Follow these steps to get the project running locally.

### Prerequisites

Ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (v14 or later recommended)
- [Yarn](https://yarnpkg.com/)

### Installation

```bash
yarn
```

This will install the dependencies required for the project.

## Local Development

Start the development server by running:

```bash
yarn start
```

This command launches a local server and opens the project in your default web browser. Any changes you make will reflect automatically.

## Build

Generate a static build of the project by running:

```bash
yarn build
```

The static content will be available in the `build/` directory. You can serve these files using any static hosting service.

## Usage Examples

### Example 1: Adding Content
To add a new page:

1. Create a new Markdown file under the `docs/` directory.
2. Add metadata at the top of your file:
   ```markdown
   ---
   id: page-id
   title: Page Title
   ---
   ```
3. Start your development server and navigate to the new page.

### Example 2: Switching Themes
Modify the `docusaurus.config.js` file to change themes. Restart the server to see the new look.

## Deployment

### Using SSH

```bash
USE_SSH=true yarn deploy
```

### Without SSH

```bash
GIT_USER=<Your GitHub username> yarn deploy
```

This command builds the project and pushes it to the `gh-pages` branch for deployment.

## Additional Resources

- [Docusaurus Docs](https://docusaurus.io/docs)
- [GitHub Pages Guide](https://pages.github.com/)

## Badges

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)