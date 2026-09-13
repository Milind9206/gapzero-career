
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'student',
  onboarded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles readable by authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, onboarded)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    COALESCE((NEW.raw_user_meta_data->>'onboarded')::boolean, false)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  course text,
  branch text,
  interest text,
  photo_url text,
  resume_url text,
  assessments_taken int NOT NULL DEFAULT 0,
  avg_score int NOT NULL DEFAULT 0,
  internships_done int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.students TO authenticated;
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "students readable" ON public.students FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert own student row" ON public.students FOR INSERT TO authenticated WITH CHECK (email = auth.jwt()->>'email');
CREATE POLICY "update own student row" ON public.students FOR UPDATE TO authenticated USING (email = auth.jwt()->>'email') WITH CHECK (email = auth.jwt()->>'email');

CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  platform text NOT NULL,
  thumbnail_url text,
  link text NOT NULL,
  area text NOT NULL,
  duration text
);
GRANT SELECT ON public.courses TO authenticated;
GRANT ALL ON public.courses TO service_role;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "courses readable" ON public.courses FOR SELECT TO authenticated USING (true);

CREATE TABLE public.certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  provider text NOT NULL,
  type text NOT NULL,
  link text NOT NULL,
  area text NOT NULL
);
GRANT SELECT ON public.certifications TO authenticated;
GRANT ALL ON public.certifications TO service_role;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "certifications readable" ON public.certifications FOR SELECT TO authenticated USING (true);

CREATE TABLE public.internships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  company text NOT NULL,
  location text NOT NULL,
  type text NOT NULL,
  field text NOT NULL,
  link text NOT NULL,
  stipend text
);
GRANT SELECT ON public.internships TO authenticated;
GRANT ALL ON public.internships TO service_role;
ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "internships readable" ON public.internships FOR SELECT TO authenticated USING (true);

CREATE TABLE public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  company text NOT NULL,
  location text NOT NULL,
  salary_range text NOT NULL,
  skills text[] NOT NULL DEFAULT '{}',
  link text NOT NULL,
  field text NOT NULL DEFAULT 'General'
);
GRANT SELECT ON public.jobs TO authenticated;
GRANT ALL ON public.jobs TO service_role;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "jobs readable" ON public.jobs FOR SELECT TO authenticated USING (true);

CREATE TABLE public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  options text[] NOT NULL,
  correct_index int NOT NULL,
  subject text NOT NULL,
  difficulty text NOT NULL DEFAULT 'Medium'
);
GRANT SELECT ON public.questions TO authenticated;
GRANT ALL ON public.questions TO service_role;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "questions readable" ON public.questions FOR SELECT TO authenticated USING (true);

CREATE TABLE public.assessment_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_email text NOT NULL,
  score int NOT NULL,
  total int NOT NULL DEFAULT 30,
  strong_areas text[] NOT NULL DEFAULT '{}',
  weak_areas text[] NOT NULL DEFAULT '{}',
  taken_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.assessment_results TO authenticated;
GRANT ALL ON public.assessment_results TO service_role;
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "results readable" ON public.assessment_results FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert own result" ON public.assessment_results FOR INSERT TO authenticated WITH CHECK (student_email = auth.jwt()->>'email');

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_email text NOT NULL,
  recipient_email text NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages readable" ON public.messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert own message" ON public.messages FOR INSERT TO authenticated WITH CHECK (sender_email = auth.jwt()->>'email');

INSERT INTO public.students (email, name, course, branch, interest, photo_url, resume_url, assessments_taken, avg_score, internships_done) VALUES
('student@gapzero.demo','Ananya Iyer','BTech','CS','Data Science','https://i.pravatar.cc/200?img=47','https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',6,78,2),
('rohan.mehta@gapzero.demo','Rohan Mehta','BTech','CS','DSA','https://i.pravatar.cc/200?img=12','https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',8,81,1),
('priya.nair@gapzero.demo','Priya Nair','MCA','IT','Web Dev','https://i.pravatar.cc/200?img=45',NULL,5,74,2),
('aditya.rao@gapzero.demo','Aditya Rao','BTech','IT','Data Science','https://i.pravatar.cc/200?img=33','https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',4,69,0),
('sana.khan@gapzero.demo','Sana Khan','BCA','CS','Web Dev','https://i.pravatar.cc/200?img=26','https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',7,88,3),
('vikram.shah@gapzero.demo','Vikram Shah','MTech','Mechanical','DSA','https://i.pravatar.cc/200?img=15',NULL,3,62,1);

INSERT INTO public.courses (title, platform, thumbnail_url, link, area, duration) VALUES
('Dynamic Programming from Scratch','Coursera','https://images.unsplash.com/photo-1518770660439-4636190af475?w=640&q=70','https://www.coursera.org/','DSA','6h'),
('Trees & Graphs in 45 Minutes','YouTube','https://images.unsplash.com/photo-1509228468518-180dd4864904?w=640&q=70','https://www.youtube.com/','DSA','45m'),
('Mastering Sorting & Searching','Udemy','https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=640&q=70','https://www.udemy.com/','DSA','4h'),
('System Design for Beginners','Udemy','https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=640&q=70','https://www.udemy.com/','DSA','9h'),
('Modern React from the Ground Up','Scrimba','https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=640&q=70','https://scrimba.com/','Web Dev','8h'),
('Node.js & REST APIs','freeCodeCamp','https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=640&q=70','https://www.freecodecamp.org/','Web Dev','7h'),
('CSS Layout Masterclass','YouTube','https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=640&q=70','https://www.youtube.com/','Web Dev','3h'),
('Full-Stack Auth & Security','Coursera','https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=640&q=70','https://www.coursera.org/','Web Dev','5h'),
('SQL & Analytics Mastery','Lumina','https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=640&q=70','https://www.coursera.org/','Data Science','6h'),
('Applied ML Foundations','Foundry','https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=640&q=70','https://www.udemy.com/','Data Science','9h'),
('Pandas & NumPy in Practice','Kaggle','https://images.unsplash.com/photo-1551288049-b1f3a99f5a5f?w=640&q=70','https://www.kaggle.com/learn','Data Science','4h'),
('Cloud & DevOps Essentials','Orbit','https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=640&q=70','https://www.coursera.org/','Data Science','5h');

INSERT INTO public.certifications (title, provider, type, link, area) VALUES
('Google Data Analytics','Google','online','https://grow.google/certificates/','Data Science'),
('AWS Cloud Practitioner','Amazon','online','https://aws.amazon.com/certification/','Data Science'),
('Meta Front-End Developer','Meta','online','https://www.coursera.org/','Web Dev'),
('MongoDB Associate Developer','MongoDB','online','https://learn.mongodb.com/','Web Dev'),
('Algorithms & Complexity','MIT OpenCourseWare','online','https://ocw.mit.edu/','DSA'),
('Competitive Programming Prep','Campus Tech Club','offline','https://codeforces.com/','DSA'),
('IBM Data Science Professional','IBM','online','https://www.coursera.org/','Data Science'),
('NPTEL Java Programming','NPTEL','offline','https://nptel.ac.in/','Web Dev');

INSERT INTO public.internships (title, company, location, type, field, link, stipend) VALUES
('Frontend Engineering Intern','Zeptolabs','Bengaluru','onsite','Web Dev','https://internshala.com/','INR 25,000/mo'),
('React Developer Intern','Nimbus Tech','Remote','remote','Web Dev','https://internshala.com/','INR 18,000/mo'),
('Data Analyst Intern','Quantly','Pune','onsite','Data Science','https://internshala.com/','INR 22,000/mo'),
('Machine Learning Intern','Orbital AI','Remote','remote','Data Science','https://internshala.com/','INR 30,000/mo'),
('Backend Engineering Intern','Hexaware Labs','Hyderabad','onsite','Web Dev','https://internshala.com/','INR 20,000/mo'),
('Algorithms Research Intern','IIT Incubation Cell','Delhi','onsite','DSA','https://internshala.com/','INR 15,000/mo'),
('SDE Intern','Flipkart','Bengaluru','onsite','DSA','https://www.flipkartcareers.com/','INR 60,000/mo'),
('Data Engineering Intern','Skyline Analytics','Remote','remote','Data Science','https://internshala.com/','INR 24,000/mo'),
('Competitive Coding Mentor Intern','CodeNest','Remote','remote','DSA','https://internshala.com/','INR 12,000/mo'),
('Full Stack Intern','Brightloom','Mumbai','onsite','Web Dev','https://internshala.com/','INR 28,000/mo');

INSERT INTO public.jobs (title, company, location, salary_range, skills, link, field) VALUES
('Junior Frontend Developer','Nimbus Tech','Remote','INR 6–9 LPA','{React,TypeScript,CSS}','https://www.naukri.com/','Web Dev'),
('Software Engineer I','Flipkart','Bengaluru','INR 12–18 LPA','{DSA,Java,"System Design"}','https://www.flipkartcareers.com/','DSA'),
('Data Analyst','Quantly','Pune','INR 7–11 LPA','{SQL,Python,Excel}','https://www.naukri.com/','Data Science'),
('Machine Learning Engineer','Orbital AI','Remote','INR 14–22 LPA','{Python,PyTorch,MLOps}','https://www.naukri.com/','Data Science'),
('Backend Developer','Hexaware Labs','Hyderabad','INR 8–13 LPA','{Node.js,Postgres,REST}','https://www.naukri.com/','Web Dev'),
('Full Stack Engineer','Brightloom','Mumbai','INR 10–15 LPA','{React,Node.js,AWS}','https://www.naukri.com/','Web Dev'),
('Associate Data Scientist','Skyline Analytics','Remote','INR 9–14 LPA','{Statistics,Pandas,SQL}','https://www.naukri.com/','Data Science'),
('Graduate Software Engineer','Zeptolabs','Bengaluru','INR 9–12 LPA','{DSA,C++,"Problem Solving"}','https://www.naukri.com/','DSA'),
('QA Automation Engineer','Hexaware Labs','Chennai','INR 6–9 LPA','{Selenium,Java,CI/CD}','https://www.naukri.com/','Web Dev'),
('Platform Engineer','Orbit Cloud','Remote','INR 13–19 LPA','{Docker,Kubernetes,Linux}','https://www.naukri.com/','Data Science');

INSERT INTO public.questions (question, options, correct_index, subject, difficulty) VALUES
('What is the average time complexity of binary search on a sorted array?','{"O(n)","O(log n)","O(n log n)","O(1)"}',1,'DSA','Easy'),
('Which data structure gives O(1) average lookup by key?','{"Array","Linked list","Hash table","Binary heap"}',2,'DSA','Easy'),
('A queue follows which order?','{"LIFO","FIFO","Random","Priority only"}',1,'DSA','Easy'),
('Worst-case time complexity of QuickSort is:','{"O(n log n)","O(n)","O(n^2)","O(log n)"}',2,'DSA','Medium'),
('Which traversal of a BST yields sorted order?','{"Pre-order","In-order","Post-order","Level-order"}',1,'DSA','Medium'),
('Dijkstra''s algorithm fails when the graph has:','{"Cycles","Negative edge weights","More than 100 nodes","Disconnected parts"}',1,'DSA','Hard'),
('Space complexity of merge sort on an array is:','{"O(1)","O(log n)","O(n)","O(n^2)"}',2,'DSA','Medium'),
('Which structure is best for implementing undo functionality?','{"Stack","Queue","Graph","Trie"}',0,'DSA','Easy'),
('If 5 machines make 5 items in 5 minutes, how long do 100 machines take to make 100 items?','{"100 minutes","5 minutes","20 minutes","1 minute"}',1,'Aptitude','Medium'),
('A train travels 60 km in 45 minutes. Its speed is:','{"75 km/h","80 km/h","90 km/h","60 km/h"}',1,'Aptitude','Medium'),
('What is 35% of 240?','{"74","82","84","96"}',2,'Aptitude','Easy'),
('The average of 5 numbers is 20. If one number is removed the average becomes 22. The removed number is:','{"12","14","16","18"}',0,'Aptitude','Medium'),
('Find the next number: 2, 6, 12, 20, 30, ?','{"36","40","42","44"}',2,'Aptitude','Easy'),
('A shirt costs 800 after a 20% discount. Original price was:','{"960","1000","1020","1200"}',1,'Aptitude','Medium'),
('If A is twice as fast as B and together they finish in 8 days, A alone takes:','{"10 days","12 days","14 days","16 days"}',1,'Aptitude','Hard'),
('Your deployed feature breaks for 5% of users on Friday evening. Best first action?','{"Rewrite the feature","Roll back the release and investigate","Wait until Monday","Email all users"}',1,'Real-World','Medium'),
('A teammate''s pull request has a bug. The best response is:','{"Merge and fix later silently","Leave a specific, kind review comment","Escalate to the manager first","Reject without comment"}',1,'Real-World','Easy'),
('A client asks for a change mid-sprint that adds 2 weeks. You should:','{"Silently absorb it","Refuse outright","Explain the trade-off and re-plan scope","Work overtime without telling anyone"}',2,'Real-World','Medium'),
('Your API is slow only at peak hours. The most useful first step is:','{"Add more features","Check monitoring and profile the bottleneck","Rewrite in another language","Increase the timeout"}',1,'Real-World','Medium'),
('You do not know the answer in an interview. Best approach?','{"Guess confidently","Say nothing","Explain your reasoning and what you would check","Change the subject"}',2,'Real-World','Easy');

INSERT INTO public.assessment_results (student_email, score, total, strong_areas, weak_areas, taken_at) VALUES
('student@gapzero.demo',24,30,'{SQL,Aptitude}','{"Web Dev"}', now() - interval '21 days'),
('student@gapzero.demo',21,30,'{DSA}','{"Data Science","Real-World"}', now() - interval '11 days'),
('student@gapzero.demo',26,30,'{DSA,"Real-World"}','{"Web Dev"}', now() - interval '3 days'),
('rohan.mehta@gapzero.demo',25,30,'{DSA}','{Aptitude}', now() - interval '6 days'),
('sana.khan@gapzero.demo',27,30,'{"Web Dev",Aptitude}','{DSA}', now() - interval '2 days');

INSERT INTO public.messages (sender_email, recipient_email, body, created_at) VALUES
('recruiter@gapzero.demo','student@gapzero.demo','Hi Ananya! I saw your Data Science assessment scores — really strong SQL work.', now() - interval '2 days'),
('student@gapzero.demo','recruiter@gapzero.demo','Thank you! I have been focusing on analytics projects this semester.', now() - interval '2 days' + interval '15 minutes'),
('recruiter@gapzero.demo','student@gapzero.demo','We have a Data Analyst opening at Quantly. Would you be open to a quick chat this week?', now() - interval '1 day'),
('student@gapzero.demo','recruiter@gapzero.demo','Absolutely — Thursday afternoon works well for me.', now() - interval '20 hours');
