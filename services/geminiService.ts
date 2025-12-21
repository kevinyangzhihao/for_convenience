

import { JobPosting, ScrapedJob } from "../types";

// 用户手动输入description，不再处理url
export const getManualJobDetails = async (jobs: JobPosting[]): Promise<ScrapedJob[]> => {
  // title和company默认空字符串，保证类型安全
  return jobs.map(job => ({
    id: job.id,
    title: job.title ?? '',
    company: job.company ?? '',
    description: job.description ?? ''
  }));
};
