export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  city?: string;
  country?: string;
  type: "full-time" | "part-time" | "contract" | "internship";
  salary?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  description: string;
  requirements: string[];
  benefits?: string[];
  postedDate: string;
  deadline?: string;
  startDate?: string;
  featured?: boolean;
  isUrgent?: boolean;
  remoteAllowed?: boolean;
  educationLevel?: string;
  experienceRequired?: number;
  skillsRequired?: string;
  viewsCount?: number;
  applicationsCount?: number;
}

export interface JobApplication {
  id: string;
  jobId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  coverLetter: string;
  resumeUrl?: string;
  submittedDate: string;
  status: "pending" | "reviewed" | "accepted" | "rejected";
}
