# PanAvest Secretary Assistant

A lightweight React + Vite app tailored for PanAvest to help the office secretary manage:

- Meetings (date, time, venue, agenda, with whom, comments, follow-up)
- Tasks and follow-ups
- Contacts
- Daily dashboard view

Built to be:

- **Very responsive** (works great on desktop, tablet, and mobile)
- **Easy to navigate** with a clean PanAvest-inspired UI
- **Ready for Supabase** as the database backend
- **Deployable on Vercel**

---

## 1. Getting started

```bash
# inside the project folder
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

---

## 2. Supabase setup

1. Go to https://supabase.com and create a new project (or use an existing one). @Sas090761
2. In the SQL editor, create the tables:

```sql
-- Meetings
create table if not exists meetings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  meeting_date date not null,
  start_time time not null,
  end_time time,
  venue text,
  agenda text,
  comments text,
  status text default 'scheduled',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Attendees
create table if not exists attendees (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid references meetings(id) on delete cascade,
  name text not null,
  role text,
  email text,
  phone text
);

-- Tasks (including follow-ups)
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid references meetings(id) on delete set null,
  title text not null,
  assignee text,
  due_date date,
  status text default 'pending',
  notes text,
  created_at timestamptz default now()
);

-- Contacts
create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  organisation text,
  email text,
  phone text,
  notes text,
  created_at timestamptz default now()
);
```

3. In Supabase, go to **Project Settings → API** and copy:

   - `Project URL`
   - `anon` public key

4. Create a `.env` file in the project root:

```bash
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

> Never commit the anon key if the repo is public unless you are comfortable with public client access and you are using Row Level Security properly.

---

## 3. Running locally with Supabase

Once you have the `.env` file:

```bash
npm run dev
```

The Meeting and Task pages will load data from Supabase.

---

## 4. Deploying to Vercel

1. Push this project to your `github.com/PanAvest` account.
2. Go to https://vercel.com, create/import the repository.
3. Set the **Environment Variables** on Vercel:

   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

4. Deploy. Vercel will build the app as a Vite React project.

---

## 5. Navigation overview

- **Dashboard** – Today's meetings & follow-ups at a glance.
- **Meetings** – Full meeting list, filters, add/edit meeting with:
  - date, time, venue, agenda, with whom, comments, follow-up tasks.
- **Tasks** – All follow-up tasks across meetings.
- **Contacts** – Key people the secretary interacts with.
- **Settings (placeholder)** – Space for future enhancements.

You can customise copy, the PanAvest logo, and brand colours in `src/index.css` and the layout components.

---
