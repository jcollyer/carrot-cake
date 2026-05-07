<p align="center">
  <img src="./public/logo-small.png" width="220px" alt="Carrot Cake logo" />
</p>

<h1 align="center">Carrot Cake</h1>

<p align="center"><strong>A multi-platform video publishing app for creators who want to upload once, schedule once, and let the system handle the rest.</strong></p>

<p align="center">
  <a href="https://carrot-cake.app/">Live App</a>
</p>

## Overview

Carrot Cake is a video publishing tool for YouTube, TikTok, and Instagram. It brings upload, scheduling, metadata editing, and account management into one workflow so creators can prepare content once and distribute it across multiple platforms with much less manual work.

> The real differentiator is not only multi-platform upload. It is scheduled publishing for TikTok and Instagram through a custom automation pipeline, giving creators a true set-and-forget workflow where native scheduling is limited or unavailable for this product flow.

## At a Glance

| Area | What Carrot Cake does |
| --- | --- |
| Multi-platform publishing | Send one video set to YouTube, TikTok, and Instagram from a single UI |
| Batch workflows | Upload and manage multiple videos in one session |
| Scheduling | Set future publish dates, including sequential scheduling across a batch |
| Autopilot delivery | Store scheduled assets and publish automatically through cron-driven backend jobs |
| Metadata control | Edit titles, captions, tags, categories, privacy settings, and platform-specific fields |

## Why It Stands Out

Most social media tools still force creators into repetitive platform-by-platform work. Carrot Cake reduces that friction, but more importantly, it fills a real scheduling gap. YouTube supports native future publishing. TikTok and Instagram, in this workflow, require a different approach. Carrot Cake solves that by storing scheduled assets, saving publish metadata, and letting cron-triggered backend routes deliver the post at the right time.

That turns follow-up work into an automated system.

## Feature Highlights


### Multi-video, multi-platform publishing

- Upload one or many videos in a single workflow.
- Cross-post the same content set across YouTube, TikTok, and Instagram.
- Review and edit platform-specific metadata before publishing.

### Scheduling built for real content pipelines

- Schedule videos for future release.
- Use sequential date assignment to quickly build a content calendar.
- Switch between publish-now and future-scheduled flows.
- View upcoming content in a calendar-based interface.

### Set-and-forget automation

- YouTube uses native scheduled publishing through its API.
- TikTok and Instagram scheduled posts are stored and published later by backend cron jobs.
- Scheduled assets remain available for deferred delivery through Amazon S3.
- Published state can be tracked after the job runs.

### Faster editing and repeatable setup

- Apply shared edits across a full batch of videos.
- Reuse metadata with saved references.
- Manage captions, tags, categories, privacy settings, and platform-specific options from one place.

## Scheduling Architecture

Carrot Cake handles each platform according to what the platform supports:

- **YouTube**: videos can be uploaded with a future publish time using the native API model.
- **TikTok + Instagram**: scheduled posts are stored first, then delivered later through custom backend automation.

This is the core engineering decision behind the product: use native scheduling where it exists, and build it where it does not.

### Deferred publishing pipeline for TikTok and Instagram

The scheduling pipeline works like this:

1. A user uploads a video and configures metadata plus a scheduled release time.
2. The asset is stored in S3 and the publishing record is saved in Neon.
3. Cron-triggered routes check which videos are due.
4. The backend posts the video to TikTok or Instagram.
5. The database is updated to reflect publishing status.

This creates a practical autopilot workflow for creators: prepare content now, let the system handle timed delivery later.

## Technology Stack

### Frontend

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Radix UI
- Ariakit

### Backend and infrastructure

- Next.js API routes
- Edge runtime handlers for scheduled publishing flows
- Prisma ORM
- Neon serverless Postgres
- Amazon S3
- Vercel deployment and cron execution

### Authentication and account connectivity

- NextAuth
- Firebase auth endpoints
- OAuth flows for YouTube, TikTok, and Instagram

## APIs and External Services

- YouTube Data API for channel access, uploads, metadata updates, and future publishing
- TikTok API for creator info, publishing, and publish-status tracking
- Instagram Graph API for media container creation and publishing
- Amazon S3 for deferred asset storage
- Neon Postgres for scheduled video records and app data

## Why This Project Matters

Carrot Cake solves a real product and engineering problem. Creators do not just need a better upload form; they need a system that removes repeated publishing work across platforms and handles scheduling reliably. The most important differentiator here is custom scheduled publishing for TikTok and Instagram, because without that layer, future posting would still require manual return visits and manual uploads.

By combining multi-platform uploads with a cron-driven scheduling pipeline, Carrot Cake turns content publishing into a more scalable workflow for creators and social media managers.

From an engineering perspective, the project combines:

- Multi-provider OAuth integrations
- Third-party API orchestration
- File upload and storage workflows
- Scheduled background publishing
- Metadata editing across different platform rules
- UI patterns designed around batch operations

