# Nudge — Signup & Onboarding Flow Prompt

---

## PROMPT (paste into Claude Code)

```
Build the complete Auth + Onboarding flow for the Nudge app.

---

## Design System (apply to every screen)

- Font: DM Serif Display (headings) + DM Sans (body) — import from Google Fonts
- Colors:
  - Dark:   #2C2318
  - Amber:  #F5A623
  - Cream:  #FAF7F2 (page bg)
  - Sand:   #E8E0D4 (borders, subtle bg)
  - Muted:  #B0A090 (secondary text)
  - Input bg: #F0E9E0
- Border radius: 12px inputs, 14px cards, 32px phone shell
- All screens: max-width 390px, centered, cream background
- Logo mark: serif "N" + amber dot below (reuse as SVG component)
- Progress dots at top: 4 dots, active dot is wider pill shape (#2C2318), inactive is sand (#E8E0D4)

---

## Screen 1 — Landing / Login  `/login`

Layout:
- Centered logo (icon + "Nudge" wordmark + tagline "야, 오늘 했어?")
- Three auth buttons stacked:
  1. "Apple로 계속하기" — dark bg (#2C2318), white text, Apple SVG icon
  2. "Google로 계속하기" — white bg, border, Google SVG icon (4-color)
  3. "이메일로 가입하기" — sand bg (#F0E9E0), envelope emoji
- Thin "또는" divider between Google and email buttons
- Fine print at bottom: "가입 시 이용약관에 동의하는 것으로 간주됩니다"
- Already have account link → goes to login form

Auth logic:
- Apple: Supabase Auth signInWithOAuth({ provider: 'apple' })
- Google: Supabase Auth signInWithOAuth({ provider: 'google' })
- Email: navigate to Screen 2
- After any successful OAuth: check if user has a group → if yes go to /feed, if no go to Screen 3

---

## Screen 2 — Email Sign Up  `/signup`

Only shown when user taps "이메일로 가입하기".

Fields:
- 이름 (name) — text input, required
- 이메일 (email) — email input, required
- 비밀번호 (password) — password input, min 8 chars

Validation (show inline red error text below field):
- Name: required
- Email: valid format
- Password: min 8 chars

On submit:
- supabase.auth.signUp({ email, password })
- Insert row into `profiles` table: { id: user.id, name }
- Navigate to Screen 3

Also show: "이미 계정이 있어요" link → goes to login form (email + password, same design)

---

## Screen 3 — Join or Create  `/onboarding`

Shown after any successful signup/login if user has no group yet.

Two choice cards (tappable, one selected at a time with amber border):

Card A — "액세스 코드로 입장" 🔑
  desc: "친구한테 받은 6자리 코드를 입력하면 바로 들어갈 수 있어요"

Card B — "새 스터디방 만들기" ✨
  desc: "내가 방을 만들고 친구들을 초대해요. 코드가 자동으로 생성돼요"

"계속하기 →" primary button (dark bg):
- If Card A selected → navigate to Screen 4a
- If Card B selected → navigate to Screen 4b

---

## Screen 4a — Enter Access Code  `/onboarding/join`

UI:
- Title: "코드를 입력해줘요"
- Subtitle: "친구한테 받은 6자리 코드"
- Single styled code input:
  - Center-aligned, DM Serif Display font, letter-spacing: 4px
  - Amber border on focus
  - Format: NUD·XXXX (auto-insert middle dot after "NUD")
  - Uppercase auto-transform
- Preview card (shows after valid code detected):
  - Sand bg, rounded
  - Group name + member count
  - Member name tags row
- "입장하기 🎉" button (amber bg, dark text) — disabled until valid code
- "← 다시 선택하기" back link

Logic:
- On each keystroke: query `groups` table where invite_code = input
- If found: show preview card with group name + member profiles
- On confirm: insert into `group_members` (group_id, user_id), assign member color, navigate to /feed

---

## Screen 4b — Create Room  `/onboarding/create`

UI:
- Title: "스터디방 이름 정해요"
- Subtitle: "나중에 바꿀 수 있어요"
- Input: 방 이름 (room name), placeholder "우리 취준 스터디 👊"
- After typing name and tapping "만들기":
  - Code box appears (dark bg #2C2318):
    - Small label: "액세스 코드" (uppercase, muted)
    - Large code in amber: "NUD·XXXX" (DM Serif Display, letter-spacing: 4px)
    - Subtext: "친구들한테 이 코드를 알려주세요"
  - Two buttons appear:
    1. "코드 공유하기 📤" — triggers native share sheet (navigator.share) with the code text
    2. "피드로 이동 →" amber button — navigates to /feed

Logic:
- Generate invite code: "NUD·" + 4 random uppercase alphanumeric chars
- Insert into `groups`: { name, invite_code, created_by: user.id }
- Insert into `group_members`: { group_id, user_id }
- Assign first member color from palette (see below)

---

## Member Color Assignment

When a user joins or creates a group, assign them a color from this palette in order:
```
const MEMBER_COLORS = [
  '#7B6FA0', // purple
  '#4A8C6F', // green
  '#C9503A', // coral
  '#5A82B4', // blue
  '#B8860B', // gold
  '#6B8E6B', // sage
  '#A0522D', // sienna
  '#4682B4', // steel blue
]
```
Pick the next unused color in the group. Store in `profiles.member_color`.

---

## Supabase Tables Needed

```sql
profiles (
  id uuid references auth.users primary key,
  name text not null,
  member_color text,
  created_at timestamptz default now()
)

groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text unique,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
)

group_members (
  group_id uuid references groups(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (group_id, user_id)
)
```

RLS policies:
- profiles: users can read/update only their own row
- groups: members can read their group; only creator can update
- group_members: members can read rows for their group_id

---

## Routing Logic (middleware.ts)

```
/ → if logged in + has group → /feed
    if logged in + no group  → /onboarding
    if not logged in         → /login

/feed, /calendar, /community, /me → require auth + group
/login, /signup                   → redirect to /feed if already logged in
/onboarding                       → require auth, redirect to /feed if already has group
```

---

## Component File Structure

```
/app
  /login/page.tsx
  /signup/page.tsx
  /onboarding/page.tsx         ← Screen 3 (join or create choice)
  /onboarding/join/page.tsx    ← Screen 4a
  /onboarding/create/page.tsx  ← Screen 4b
  /middleware.ts

/components/auth
  LogoMark.tsx        ← "N" + amber dot SVG, reusable
  SocialButton.tsx    ← Apple / Google / Email button
  ProgressDots.tsx    ← 4-dot progress indicator
  ChoiceCard.tsx      ← tappable card with emoji + title + desc
  CodeInput.tsx       ← styled code input with auto-format
  CodeDisplay.tsx     ← dark box showing generated code
  MemberPreview.tsx   ← group preview card with member tags

/lib
  supabase.ts
  generateInviteCode.ts   ← returns "NUD·" + 4 random chars
  assignMemberColor.ts    ← picks next unused color in group
```

---

## Notes

- All screens are mobile-first, max-width 390px, centered on desktop
- No email verification required on signup (keep it frictionless)
- After OAuth signup, create profile row if it doesn't exist yet (use upsert)
- Show loading spinner on buttons while async calls are in flight
- Code input: strip spaces, uppercase, auto-insert "·" after position 3
- navigator.share fallback: if not supported, show "코드 복사됨!" toast on copy
```
