# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an educational project demonstrating OAuth 2.0 Authorization Code Flow with PKCE (Proof Key for Code Exchange) implementation in SSR (Server-Side Rendering) applications. The project contains sample implementations and presentation slides explaining the concepts.

## Project Structure

- `/slides/` - Slidev presentation explaining OAuth 2.0 and PKCE concepts
- `/samples/with-better-auth/` - Sample implementation using Better Auth library
- `/samples/with-supabase/` - Sample implementation using Supabase

## Development Commands

### Slides (Slidev Presentation)
```bash
cd slides
pnpm dev      # Start presentation dev server
pnpm build    # Build presentation
pnpm export   # Export presentation
```

### Sample Applications
Both sample applications share the same commands:

```bash
cd samples/with-better-auth  # or samples/with-supabase
pnpm dev       # Start development server
pnpm build     # Build for production
pnpm preview   # Preview production build
pnpm deploy    # Deploy to Cloudflare Workers
pnpm typecheck # Run TypeScript type checking
```

## Architecture

### Technology Stack
- **Framework**: React Router v7 with SSR enabled
- **Runtime**: Cloudflare Workers (edge deployment)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **Package Manager**: pnpm

### Key Configuration Files
- `react-router.config.ts` - SSR configuration with experimental Vite environment API
- `vite.config.ts` - Vite configuration with React Router, Cloudflare, and Tailwind plugins
- `wrangler.jsonc` - Cloudflare Workers deployment configuration
- `tsconfig.json` - TypeScript configuration with strict mode

### Authentication Flow
The samples demonstrate OAuth 2.0 Authorization Code Flow with PKCE:
- `with-better-auth`: Uses Better Auth library for authentication
- `with-supabase`: Uses Supabase authentication

Both implementations follow the same architectural pattern with SSR-compatible authentication handling suitable for edge environments.

## Important Notes

- No test framework is configured - testing infrastructure would need to be added if required
- The project uses experimental Vite environment API for SSR
- All sample apps are designed to run on Cloudflare Workers/Pages
- Type generation is automated via postinstall hooks (`pnpm cf-typegen`)