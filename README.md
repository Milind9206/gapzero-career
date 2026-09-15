# Career Forge

Build a mobile-first, responsive demo/prototype web app called "GapZero" — an AI-powered career platform (like LinkedIn + Naukri) that helps students close skill gaps via AI-driven recommendations, self-assessments, and resume guidance. This is a hackathon prototype for a judged demo — prioritize a smooth, impressive click-through experience over production-grade backend logic. Use Supabase for simple auth and to store all sample data (so it feels real and persists), but keep everything else lightweight.

Tech & Structure
Fully responsive, clean and modern UI, works well on mobile and desktop
Use Supabase for auth (email/password, simple sign up + login) and as the database for all sample data below
Three user roles: Student, College, Recruiter — role chosen at signup, stored on the user's profile, and used to route to the correct dashboard after login
Pre-seed the database with sample accounts for demo purposes (see below) so judges/testers can log straight in without signing up
Include a floating AI chat assistant called "Forge" on every dashboard — a real working chat widget (calls an LLM) for general Q&A/FAQs about the platform and basic career advice
Auth & Sample Accounts
Build a clean login/signup page with a role selector (Student / College / Recruiter) for new signups
Also show 3 "Quick Demo Login" buttons on the login page — one per role — that auto-fill and log in with pre-seeded demo accounts, so judges can jump straight into any dashboard:
Demo Student: student@gapzero.demo / demo1234
Demo College: college@gapzero.demo / demo1234
Demo Recruiter: recruiter@gapzero.demo / demo1234
On first login, a new student account goes through onboarding (see below); demo accounts should already have onboarding data pre-filled
Sample Data to Seed (store in Supabase tables, not hardcoded in frontend)
Students table — seed 5-6 sample student profiles with: name, email, course (BTech/MCA/etc), branch (CS/IT/etc), interest area (DSA/Web Dev/Data Science), profile photo (placeholder), resume file (placeholder PDF or "no file"), assessments taken (count), average score, internships completed (count)
Courses/Videos table — seed 10-12 sample entries across interest areas (DSA, Web Dev, Data Science, etc.) with: title, platform name, thumbnail image URL, external link
Certifications table — seed 6-8 sample entries with: title, provider, type (online/offline), external link
Internships table — seed 8-10 sample entries with: title, company name, location, type (remote/onsite), field/tag, external apply link
Jobs table — seed 8-10 sample entries with: title, company, location, salary range, required skills (tags), external apply link
Questions table — seed 15-20 sample assessment questions across 2-3 subjects (DSA, Aptitude, one real-world scenario type) with: question text, 4 options, correct answer, subject tag, difficulty
Assessment Results table — seed a few sample results linked to demo student(s): score, strong areas, weak areas, date taken (so the demo student's dashboard shows history, not a blank state)
Messages table — seed a short sample conversation between a demo recruiter and a demo student so the messaging UI has content on first load
Student Dashboard (main focus — build this fully)
Onboarding flow (new accounts only): ask what they're studying (dropdown: BCA, MCA, BTech, MTech, BCom, Other), branch/specialization (dropdown: CS, IT, Mechanical, Other), and what they want to learn/get a job in (chips: DSA, Web Dev, Data Science, etc). Save to their profile in Supabase.
Dashboard home: profile summary card (pulled from Supabase), "Recommended Courses & Videos" cards filtered by their interest, "Certifications" cards
Internships tab: list filtered by field, clicking opens external apply link in new tab
Jobs tab: ask target job role (text input), upload CV (store file in Supabase storage, no real parsing needed), show a "Forge AI is tailoring your resume..." loading animation then a mocked before/after improvement summary, then a list of matching jobs with apply links
Self-Assessment tab: start screen (30 questions, timer info) → one question at a time from the seeded question bank, multiple choice, visible per-question countdown timer with auto-advance → results screen showing score, strong/weak areas, saved to Supabase → "Recommended for you" reusing course cards based on weak areas
College Dashboard
Table of all seeded student profiles: name, course, assessments taken, avg score, internships done
Search bar to filter by name
Clicking a student opens a detail view: full profile, assessment result history, resume/CV preview (pulled from Supabase)
Recruiter Dashboard
Same student table/search as College dashboard
"Message" button per student opening a chat UI showing the seeded conversation (if one exists) or an empty chat they can type into (store new messages in Supabase so it feels functional)
Overall priorities
This is a judged hackathon demo — make it look polished, feel fast, and let a judge log in with any demo account and click through the full journey without hitting blank/broken states, since every table is pre-seeded with realistic sample data. The Student journey (onboarding → recommendations → internship → job + resume tailoring → assessment → results) should be flawless. College/Recruiter dashboards need to look convincing and data-rich, not necessarily deep. Forge AI chat should actually work — it's an easy, impressive touch for judges.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c51beb36-ce03-4551-98a4-311d66686970).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
