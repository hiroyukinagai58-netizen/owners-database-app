export interface Company {
  company_id: number;
  area: string;
  name: string;
  ceo: string;
  pic?: string | null;
  address: string;
  tel: string;
  mail?: string | null;
  registered_owner?: string | null;
  related_company?: string | null;
  banks?: string | null;
  broker?: string | null;
  type_of_vessel?: string | null;
  shipyard?: string | null;
  tc_fleet?: string | null;
  bbc_fleet?: string | null;
  tc_charterer?: string | null;
  bbc_charterer?: string | null;
  newbuilding?: string | null;
}

export interface CreateCompanyInput {
  area: string;
  name: string;
  ceo: string;
  address: string;
  tel: string;
  mail?: string | null;
  type_of_vessel?: string | null;
}

export interface Vessel {
  vessel_id: number;
  company_id: number;
  section?: string | null;
  type?: string | null;
  imo?: string | null;
  name: string;
  flag?: string | null;
  dwt?: number | null;
  [key: string]: unknown;
}

export interface CreateVesselInput {
  company_id: number;
  section?: string | null;
  type?: string | null;
  imo?: string | null;
  name: string;
  flag?: string | null;
  dwt?: number | null;
}

export interface MeetingRecord {
  id: string;
  attendees: string[];
  content: string;
  nextAction: string;
  date: string;
}

export interface SeedData {
  companies: Company[];
  vessels: Vessel[];
  meetings: MeetingRecord[];
}
