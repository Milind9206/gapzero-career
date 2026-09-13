import { supabase } from "@/integrations/supabase/client";

export type Student = {
  id: string;
  email: string;
  name: string;
  course: string | null;
  branch: string | null;
  interest: string | null;
  photo_url: string | null;
  resume_url: string | null;
  assessments_taken: number;
  avg_score: number;
  internships_done: number;
};

export type Course = {
  id: string;
  title: string;
  platform: string;
  thumbnail_url: string | null;
  link: string;
  area: string;
  duration: string | null;
};

export type Certification = {
  id: string;
  title: string;
  provider: string;
  type: string;
  link: string;
  area: string;
};

export type Internship = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  field: string;
  link: string;
  stipend: string | null;
};

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary_range: string;
  skills: string[];
  link: string;
  field: string;
};

export type Question = {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  subject: string;
  difficulty: string;
};

export type AssessmentResult = {
  id: string;
  student_email: string;
  score: number;
  total: number;
  strong_areas: string[];
  weak_areas: string[];
  taken_at: string;
};

export type Message = {
  id: string;
  sender_email: string;
  recipient_email: string;
  body: string;
  created_at: string;
};

export const INTEREST_AREAS = ["DSA", "Web Dev", "Data Science"] as const;
export const COURSES_OPTIONS = ["BCA", "MCA", "BTech", "MTech", "BCom", "Other"];
export const BRANCH_OPTIONS = ["CS", "IT", "Mechanical", "Other"];

export const studentsQuery = () => ({
  queryKey: ["students"],
  queryFn: async () => {
    const { data, error } = await supabase.from("students").select("*").order("name");
    if (error) throw error;
    return data as Student[];
  },
});

export const studentQuery = (email: string | undefined) => ({
  queryKey: ["student", email],
  enabled: !!email,
  queryFn: async () => {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("email", email!)
      .maybeSingle();
    if (error) throw error;
    return (data as Student) ?? null;
  },
});

export const coursesQuery = () => ({
  queryKey: ["courses"],
  queryFn: async () => {
    const { data, error } = await supabase.from("courses").select("*");
    if (error) throw error;
    return data as Course[];
  },
});

export const certificationsQuery = () => ({
  queryKey: ["certifications"],
  queryFn: async () => {
    const { data, error } = await supabase.from("certifications").select("*");
    if (error) throw error;
    return data as Certification[];
  },
});

export const internshipsQuery = () => ({
  queryKey: ["internships"],
  queryFn: async () => {
    const { data, error } = await supabase.from("internships").select("*");
    if (error) throw error;
    return data as Internship[];
  },
});

export const jobsQuery = () => ({
  queryKey: ["jobs"],
  queryFn: async () => {
    const { data, error } = await supabase.from("jobs").select("*");
    if (error) throw error;
    return data as Job[];
  },
});

export const questionsQuery = () => ({
  queryKey: ["questions"],
  queryFn: async () => {
    const { data, error } = await supabase.from("questions").select("*");
    if (error) throw error;
    return data as Question[];
  },
});

export const resultsQuery = (email: string | undefined) => ({
  queryKey: ["results", email],
  enabled: !!email,
  queryFn: async () => {
    const { data, error } = await supabase
      .from("assessment_results")
      .select("*")
      .eq("student_email", email!)
      .order("taken_at", { ascending: false });
    if (error) throw error;
    return data as AssessmentResult[];
  },
});

export const conversationQuery = (a: string | undefined, b: string | undefined) => ({
  queryKey: ["conversation", a, b],
  enabled: !!a && !!b,
  queryFn: async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_email.eq.${a},recipient_email.eq.${b}),and(sender_email.eq.${b},recipient_email.eq.${a})`,
      )
      .order("created_at");
    if (error) throw error;
    return data as Message[];
  },
});
