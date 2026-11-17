export type DomainCategory =
  | 'programming-languages'
  | 'frontend-engineering'
  | 'backend-development'
  | 'mobile-development'
  | 'desktop-development'
  | 'database-technologies'
  | 'cloud-computing'
  | 'devops-platform-engineering'
  | 'operating-systems'
  | 'networking-infrastructure'
  | 'cybersecurity'
  | 'data-engineering'
  | 'business-intelligence'
  | 'artificial-intelligence'
  | 'software-testing'
  | 'software-architecture'
  | 'enterprise-software'
  | 'blockchain'
  | 'embedded-iot'
  | 'game-development'
  | 'storage-virtualization'
  | 'monitoring-observability'
  | 'low-code-automation'
  | 'product-management';

export interface Domain {
  id: string;
  name: string;
  slug: DomainCategory | string;
  description: string;
  icon: string;
  displayOrder: number;
  technologyCount: number;
  createdAt: string;
  updatedAt: string;
}
