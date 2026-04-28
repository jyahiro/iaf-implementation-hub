import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'IAF Implementation Hub',
  tagline: 'Operationalizing the INFORMS Analytics Framework for Public Sector Missions.',
  favicon: 'img/favicon.ico',
  /** Explicit trailing slash avoids GitHub Pages redirect quirks (Docusaurus deploy warning). */
  trailingSlash: true,

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://jyahiro.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/iaf-implementation-hub/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'jyahiro', // Usually your GitHub org/user name.
  projectName: 'iaf-implementation-hub', // Usually your repo name.

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://github.com/jyahiro/iaf-implementation-hub/tree/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/og-thumbnail.png',
    announcementBar: {
      id: 'legal-guardrail',
      content:
        'Legal guardrail: all Hub guidance is governed by applicable law and policy, including the Evidence Act. <a href="/iaf-implementation-hub/docs/legal-policy/compliance-checkpoints/">View legal guardrails and required controls</a>.',
      isCloseable: true,
    },
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: false,
      disableSwitch: false,
    },
    navbar: {
      title: 'IAF Implementation Hub',
      logo: {
        alt: 'INFORMS Logo',
        src: 'img/informs-logo-official-clean.png',
      },
      items: [
        {to: '/', label: 'Home', position: 'left'},
        {to: '/docs/start-here/', label: 'Start Here', position: 'left'},
        {to: '/docs/domains/business-problem-framing/', label: 'Domain Standards', position: 'left'},
        {
          type: 'dropdown',
          label: 'Resources',
          position: 'left',
          items: [
            {to: '/docs/implementation-toolkit/', label: 'Implementation Toolkit'},
            {to: '/docs/public-sector/templates/', label: 'Digital Templates'},
            {to: '/docs/service-catalog/', label: 'Service Catalog'},
            {to: '/docs/release-notes/', label: 'Release Notes'},
          ],
        },
        {to: '/docs/platform/architecture/', label: 'Platform', position: 'left'},
        {to: '/docs/legal-policy/compliance-checkpoints/', label: 'Legal and Policy', position: 'left'},
        {
          href: 'https://github.com/jyahiro/iaf-implementation-hub',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Get Started',
              to: '/docs/',
            },
            {
              label: 'Core Domains',
              to: '/docs/domains/business-problem-framing/',
            },
            {
              label: 'Implementation Toolkit',
              to: '/docs/implementation-toolkit/',
            },
            {
              label: 'Digital Templates',
              to: '/docs/public-sector/templates/',
            },
            {
              label: 'Service Catalog',
              to: '/docs/service-catalog/',
            },
            {
              label: 'Legal Guardrails',
              to: '/docs/legal-policy/compliance-checkpoints/',
            },
            {
              label: 'Release Notes',
              to: '/docs/release-notes/',
            },
          ],
        },
        {
          title: 'IAF Resources',
          items: [
            {
              label: 'INFORMS',
              href: 'https://www.informs.org',
            },
            {
              label: 'Analytics Framework',
              href: 'https://www.informs.org/Explore/Analytics',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/jyahiro/iaf-implementation-hub',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} IAF Implementation Hub. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
