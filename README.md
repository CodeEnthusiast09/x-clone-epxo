# x-clone-expo

A full-featured mobile rebuild of [burakorkmez/x-clone-rn](https://github.com/burakorkmez/x-clone-rn) using **Expo SDK 54**, **NativeWind v4**, and a Go backend ([x-clone-api](../x-clone-api)).

---

## Tech Stack

| Concern | Package | Version |
|---|---|---|
| Framework | Expo | ~54.0.35 |
| Routing | Expo Router | ~6.0.24 |
| Auth | @clerk/clerk-expo | 2.19.31 |
| Styling | NativeWind + Tailwind CSS | ^4 + ^3.4 |
| Server state | TanStack Query | ^5.101.0 |
| Global state | Zustand | ^5.0.14 |
| HTTP | axios | ^1.17.0 |
| Validation | Zod | ^4.4.3 |
| Date formatting | date-fns | ^4.4.0 |
| Image picker | expo-image-picker | ~17.0.11 |
| Push notifications | expo-notifications | ~0.32.17 |
| SSO / OAuth | expo-web-browser + expo-auth-session | ~15.0.11 / ~7.0.11 |

---

## Features

### Auth
- Email + password sign-up (with email verification code)
- Email + password sign-in
- Google OAuth and Apple OAuth on both sign-in and sign-up screens via Clerk `useSSO()`
- Automatic user record sync to the Go backend after every auth event

### Feed
- Infinite-scroll post feed
- Create posts (text only, or text + image)
- Image upload via Cloudinary signed upload — get a server-signed token, upload directly from the device, send the resulting URL with the post
- Delete your own posts (confirmation alert)
- Like / unlike with optimistic UI — heart flips instantly on both the feed **and** the profile screen
- Tap the comments icon → full-screen comments modal (post preview, comments list, add comment)

### Search
- Debounced live search across posts and users
- Tabs: Top (users + posts), Latest, People, Media (posts with images)
- Tapping a user navigates to their profile

### Notifications
- In-app notification list (likes, comments, follows) — paginated, unread dot
- Mark all read + badge reset on open
- Push notifications via Expo push gateway
- Deep-link on notification tap: follow notifications go to the actor's profile; like/comment notifications go to the notifications tab

### Profile
- Public profile with avatar, banner, bio, location, joined date, followers/following counts
- Follow / unfollow with instant UI update
- View any user's posts from their profile
- Edit own profile: name, bio, location, avatar (Cloudinary upload), banner (Cloudinary upload)

### Messaging
- Conversation list with unread badge counts
- Start a new conversation by @username
- Real-time chat via WebSocket — messages arrive without polling
- Message history loaded on open; new WebSocket messages deduplicated against history

---

## SDK Version — Why 54, and the `npx expo install` Rule

This project targets **Expo SDK 54**. Every native package must match the SDK version or Metro will warn at runtime and TypeScript types may drift.

**Always install native Expo packages with:**

```bash
npx expo install <package-name>
```

Never use `yarn add` for Expo packages. `npx expo install` resolves the version that matches your SDK before handing off to yarn. Using `yarn add` directly pulls whatever is latest on npm, which may be built for a newer SDK.

### What went wrong with `expo-notifications`

When `expo-notifications` was first installed with `yarn add`, it resolved to `0.34.x` (SDK 56). The `PermissionResponse` type in that version dropped the `status: string` field in favour of a `granted: boolean`. Since `expo@54` was still exporting the old type shape, TypeScript failed on the permission check:

```
// SDK 56 type — only has 'granted'
const { granted } = await Notifications.requestPermissionsAsync();

// expo@54 still expected 'status' — type error
```

**Fix:** uninstall and reinstall with `npx expo install`:

```bash
yarn remove expo-notifications expo-device
npx expo install expo-notifications expo-device
# resolved to: expo-notifications@0.32.17, expo-device@8.0.10
```

The `npx expo install` command reads the `expo` version in `package.json` and picks the matching peer versions from Expo's version map.

---

## Root Config Files

Several config files must live at the project root — they cannot be moved:

| File | Why it's there |
|---|---|
| `babel.config.js` | Metro reads only `babel.config.js` (not `.ts`). NativeWind v4 requires `jsxImportSource: 'nativewind'` here to transform JSX. |
| `metro.config.js` | NativeWind hooks into Metro's transformer via `withNativeWind()`. Metro always looks for this file at the root. |
| `tailwind.config.js` | Tailwind CLI and NativeWind's build step expect this at the root by convention. |
| `nativewind-env.d.ts` | Adds `/// <reference types="nativewind/types" />` so TypeScript recognises the `className` prop on React Native components. |

---

## Project Structure

```
src/
├── app/                        ← Expo Router routes (thin — import screen, render it)
│   ├── _layout.tsx             ← ClerkProvider, QueryClientProvider, AuthGuard, push notifications
│   ├── (auth)/                 ← sign-in, sign-up
│   ├── (tabs)/                 ← home, search, notifications, messages, profile tabs
│   ├── profile/[username].tsx  ← dynamic profile route
│   ├── chat/[conversationId].tsx
│   ├── compose.tsx
│   └── edit-profile.tsx
├── screens/                    ← real screen UI (all logic lives here)
│   ├── home/
│   ├── search/
│   ├── notifications/
│   ├── messages/
│   ├── chat/
│   ├── profile/
│   ├── edit-profile/
│   ├── compose/
│   ├── sign-in/
│   └── sign-up/
├── components/
│   ├── post-card/              ← PostCard with like, comments modal, delete
│   └── comments-modal/        ← full-screen comments sheet
├── hooks/
│   ├── common/
│   │   ├── useDebounce.ts
│   │   ├── useConversationWS.ts
│   │   └── usePushNotifications.ts
│   └── services/               ← TanStack Query hooks by domain
│       ├── auth/               ← useSync
│       ├── comments/           ← useComments, useCreateComment
│       ├── conversations/      ← useConversations, useMessages, useStartConversation
│       ├── notifications/      ← useNotifications, useMarkAllRead
│       ├── posts/              ← usePosts, useCreatePost, useDeletePost, useToggleLike, useUserPosts
│       ├── search/             ← useSearch
│       └── users/              ← useProfile, useToggleFollow, useEditProfile
├── services/client/            ← raw axios calls (no React)
│   ├── client-request-gateway.ts   ← axios instance, JWT interceptor
│   ├── auth-api.ts
│   ├── comments-api.ts
│   ├── conversations-api.ts
│   ├── notifications-api.ts
│   ├── posts-api.ts
│   ├── search-api.ts
│   ├── upload-api.ts           ← Cloudinary signed upload signature endpoints
│   ├── users-api.ts
│   └── index.ts                ← single `clientRequest` export
├── store/
│   └── auth-store.ts           ← Zustand: currentUser, theme
├── interfaces/                 ← shared TypeScript types
├── validations/                ← Zod schemas
├── utils/
│   ├── format-date.ts
│   └── cloudinary-upload.ts    ← direct Cloudinary upload using signed token
├── lib/
│   ├── query-client.ts
│   └── token-cache.ts
└── constants/
    └── index.ts                ← API_URL, CLERK_PUBLISHABLE_KEY
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_API_URL` | Base URL of the Go backend (e.g. `http://192.168.x.x:8080`) |
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key from your Clerk dashboard |

> Use your machine's LAN IP, not `localhost`, when running on a physical device. `localhost` on a phone points to the phone itself.

---

## Setup

```bash
# 1. Install dependencies
yarn install

# 2. Add environment variables
cp .env.example .env
# fill in EXPO_PUBLIC_API_URL and EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY

# 3. Start Metro
yarn start

# 4. Run on device / emulator
yarn android
yarn ios
```

### Clerk Dashboard Setup

1. Create a Clerk application.
2. Enable **Email/Password**, **Google OAuth**, and **Apple OAuth** under Sign-in methods.
3. Add a webhook pointing to `<your-backend>/api/webhooks/clerk` — subscribe to `user.created` and `user.updated` events.
4. Copy the publishable key into `.env`.

### Cloudinary Setup

Image upload is handled by the backend — the mobile client never holds Cloudinary credentials. The backend signs upload requests; see [x-clone-api README](../x-clone-api/README.md) for setup.

---

## Data Flow

```
services/client/          ← typed axios calls, no React
    ↓
hooks/services/<domain>/  ← TanStack Query wrappers (useQuery / useMutation)
    ↓
screens/                  ← consume hooks, render UI
```

All server state lives in TanStack Query. Zustand holds only non-server state: `currentUser` (after sync) and `theme`.

---

## Commands

```bash
yarn start     # start Metro bundler
yarn android   # open on Android
yarn ios       # open on iOS
yarn lint      # ESLint
```
