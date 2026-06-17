export interface JobOffer {
  id: number;
  uuid: string;
  recruiterUuid: string;
  recruiterName: string;
  companyName: string;
  title: string;
  description: string;
  requirements: string | null;
  jobType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";
  status: string;
  location: string;
  city: string;
  country: string;
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  experienceRequired: number;
  educationLevel: string;
  skillsRequired: string;
  applicationDeadline: string;
  startDate: string;
  remoteAllowed: boolean;
  viewsCount: number;
  applicationsCount: number;
  isFeatured: boolean;
  isUrgent: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface JobsResponse {
  content: JobOffer[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      empty: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  first: boolean;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    empty: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  empty: boolean;
}

export interface JobsRequestParams {
  page?: number;
  size?: number;
  sort?: string[];
}

export interface SkillType {
  id: number;
  uuid: string;
  name: string;
  description: string;
  iconUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}