#!/usr/bin/env node

/**
 * Minimal starter scaffold for a Next.js project.
 *
 * This file is intentionally a lightweight template that can be copied into a
 * real application bootstrap flow. It gives the repository a concrete Next.js
 * starting point without introducing framework-specific build tooling yet.
 */

const template = `import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Next.js Starter</title>
        <meta name="description" content="A Next.js starter template." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main style={{ display: 'grid', minHeight: '100vh', placeItems: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <section style={{ maxWidth: 640, padding: '2rem' }}>
          <h1>Welcome to your Next.js starter</h1>
          <p>
            This template provides a clean starting point for building a Next.js
            app in signoos-canary.
          </p>
        </section>
      </main>
    </>
  );
}
`;

process.stdout.write(template);
