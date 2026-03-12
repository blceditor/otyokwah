export interface UltraCampSession {
  sessionId: string;
  sessionName: string;
  plainSessionName: string;
  beginDate: string;
  endDate: string;
  cost: string;
  totalEnrollment: number;
  maxTotal: number;
  maleEnrollment: number;
  maxMales: number;
  femaleEnrollment: number;
  maxFemales: number;
  totalHoldCount: number;
  totalWaitListCount: number;
  open: boolean;
  registrationLink: string;
  category: string;
  subCategory1: string;
}

// Mock data — replace with real UltraCamp API call once API key is available
// Real endpoint: GET https://rest.ultracamp.com/api/camps/268/sessions
// Auth: Basic Base64(268:API_KEY)
const MOCK_SESSIONS: UltraCampSession[] = [
  {
    sessionId: "1001",
    sessionName: "PO - Primary Overnight",
    plainSessionName: "Primary Overnight",
    beginDate: "6/4/2026",
    endDate: "6/5/2026",
    cost: "$100",
    totalEnrollment: 22,
    maxTotal: 25,
    maleEnrollment: 12,
    maxMales: 15,
    femaleEnrollment: 10,
    maxFemales: 15,
    totalHoldCount: 1,
    totalWaitListCount: 0,
    open: true,
    registrationLink:
      "https://www.ultracamp.com/clientlogin.aspx?idCamp=268&campCode=blc",
    category: "Summer Camp",
    subCategory1: "Primary",
  },
  {
    sessionId: "1002",
    sessionName: "JR1 - Junior 1 (4th-6th Grades)",
    plainSessionName: "Junior 1 (4th-6th Grades)",
    beginDate: "6/14/2026",
    endDate: "6/19/2026",
    cost: "$390",
    totalEnrollment: 35,
    maxTotal: 50,
    maleEnrollment: 18,
    maxMales: 25,
    femaleEnrollment: 17,
    maxFemales: 25,
    totalHoldCount: 2,
    totalWaitListCount: 0,
    open: true,
    registrationLink:
      "https://www.ultracamp.com/clientlogin.aspx?idCamp=268&campCode=blc",
    category: "Summer Camp",
    subCategory1: "Junior",
  },
  {
    sessionId: "1003",
    sessionName: "JR2 - Junior 2 (4th-6th Grades)",
    plainSessionName: "Junior 2 (4th-6th Grades)",
    beginDate: "7/5/2026",
    endDate: "7/10/2026",
    cost: "$390",
    totalEnrollment: 42,
    maxTotal: 50,
    maleEnrollment: 22,
    maxMales: 25,
    femaleEnrollment: 20,
    maxFemales: 25,
    totalHoldCount: 0,
    totalWaitListCount: 3,
    open: true,
    registrationLink:
      "https://www.ultracamp.com/clientlogin.aspx?idCamp=268&campCode=blc",
    category: "Summer Camp",
    subCategory1: "Junior",
  },
  {
    sessionId: "1004",
    sessionName: "JR3 - Junior 3 (3rd-5th Grades)",
    plainSessionName: "Junior 3 (3rd-5th Grades)",
    beginDate: "7/19/2026",
    endDate: "7/23/2026",
    cost: "$390",
    totalEnrollment: 15,
    maxTotal: 50,
    maleEnrollment: 8,
    maxMales: 25,
    femaleEnrollment: 7,
    maxFemales: 25,
    totalHoldCount: 0,
    totalWaitListCount: 0,
    open: true,
    registrationLink:
      "https://www.ultracamp.com/clientlogin.aspx?idCamp=268&campCode=blc",
    category: "Summer Camp",
    subCategory1: "Junior",
  },
  {
    sessionId: "1005",
    sessionName: "JH1 - Jr. High 1",
    plainSessionName: "Jr. High 1",
    beginDate: "6/7/2026",
    endDate: "6/12/2026",
    cost: "$390",
    totalEnrollment: 52,
    maxTotal: 60,
    maleEnrollment: 28,
    maxMales: 30,
    femaleEnrollment: 24,
    maxFemales: 30,
    totalHoldCount: 1,
    totalWaitListCount: 2,
    open: true,
    registrationLink:
      "https://www.ultracamp.com/clientlogin.aspx?idCamp=268&campCode=blc",
    category: "Summer Camp",
    subCategory1: "Jr. High",
  },
  {
    sessionId: "1006",
    sessionName: "JH2 - Jr. High 2",
    plainSessionName: "Jr. High 2",
    beginDate: "6/21/2026",
    endDate: "6/26/2026",
    cost: "$390",
    totalEnrollment: 45,
    maxTotal: 60,
    maleEnrollment: 24,
    maxMales: 30,
    femaleEnrollment: 21,
    maxFemales: 30,
    totalHoldCount: 0,
    totalWaitListCount: 0,
    open: true,
    registrationLink:
      "https://www.ultracamp.com/clientlogin.aspx?idCamp=268&campCode=blc",
    category: "Summer Camp",
    subCategory1: "Jr. High",
  },
  {
    sessionId: "1007",
    sessionName: "JH3 - Jr. High 3",
    plainSessionName: "Jr. High 3",
    beginDate: "7/12/2026",
    endDate: "7/17/2026",
    cost: "$390",
    totalEnrollment: 28,
    maxTotal: 60,
    maleEnrollment: 15,
    maxMales: 30,
    femaleEnrollment: 13,
    maxFemales: 30,
    totalHoldCount: 0,
    totalWaitListCount: 0,
    open: true,
    registrationLink:
      "https://www.ultracamp.com/clientlogin.aspx?idCamp=268&campCode=blc",
    category: "Summer Camp",
    subCategory1: "Jr. High",
  },
  {
    sessionId: "1008",
    sessionName: "SH - Sr. High",
    plainSessionName: "Sr. High",
    beginDate: "6/28/2026",
    endDate: "7/3/2026",
    cost: "$390",
    totalEnrollment: 38,
    maxTotal: 50,
    maleEnrollment: 20,
    maxMales: 25,
    femaleEnrollment: 18,
    maxFemales: 25,
    totalHoldCount: 3,
    totalWaitListCount: 0,
    open: true,
    registrationLink:
      "https://www.ultracamp.com/clientlogin.aspx?idCamp=268&campCode=blc",
    category: "Summer Camp",
    subCategory1: "Sr. High",
  },
];

export async function fetchUltraCampSessions(): Promise<UltraCampSession[]> {
  const apiKey = process.env.ULTRACAMP_API_KEY;

  if (!apiKey) {
    return MOCK_SESSIONS;
  }

  const campId = "268";
  const credentials = Buffer.from(`${campId}:${apiKey}`).toString("base64");

  const res = await fetch(
    `https://rest.ultracamp.com/api/camps/${campId}/sessions`,
    {
      headers: {
        Authorization: `Basic ${credentials}`,
        Accept: "application/json",
      },
      next: { revalidate: 300 },
    },
  );

  if (!res.ok) {
    console.error(`[UltraCamp] API error: ${res.status} ${res.statusText}`);
    return MOCK_SESSIONS;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any[] = await res.json();

  return data.map((s) => ({
    sessionId: String(s.SessionId || ""),
    sessionName: s.SessionName || "",
    plainSessionName: s.PlainSessionName || "",
    beginDate: s.BeginDate || "",
    endDate: s.EndDate || "",
    cost: s.Cost || "",
    totalEnrollment: parseInt(s.TotalEnrollment, 10) || 0,
    maxTotal: parseInt(s.MaxTotal, 10) || 0,
    maleEnrollment: parseInt(s.MaleEnrollment, 10) || 0,
    maxMales: parseInt(s.MaxMales, 10) || 0,
    femaleEnrollment: parseInt(s.FemaleEnrollment, 10) || 0,
    maxFemales: parseInt(s.MaxFemales, 10) || 0,
    totalHoldCount: parseInt(s.TotalHoldCount, 10) || 0,
    totalWaitListCount: parseInt(s.TotalWaitListCount, 10) || 0,
    open: s.Open ?? true,
    registrationLink: s.RegistrationLink || "",
    category: s.SessionMasterCategory || "",
    subCategory1: s.SubCategory1 || "",
  }));
}
