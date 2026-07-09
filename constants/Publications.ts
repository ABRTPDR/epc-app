// Standard issue eg. TFP/2024/Issue Two
export interface Issue {
	name: string;
	categoryId: number;
  includedArticles?: number[];
  excludedArticles?: number[];
}

// For fest presses, issue is either standard issue, or a parent folder that holds multiple sub-issues but has no useful categoryId itself eg. BEP/2024/Issue Zero/CoSSAc
export interface GroupedIssue {
	name: string;
	children: Issue[];
}

// An item in the catalog can be either a standard issue OR a grouped folder
export type IssueItem = Issue | GroupedIssue;

// Discriminated union needed instead of just putting hasSpecialIssue as parameter of an interface, for conditional logic
// Needed only for TFP, hence we can consider standard issue
export type YearCatalog = {
  issues: IssueItem[];
} & (
  // Case 1: No special issue, if hasSpecialIssue missing/false. specialIssueName string forbidden
  | { hasSpecialIssue?: false; specialIssueName?: never }
  // Case 2: Has special issue. specialIssueName string strictly required
  | { hasSpecialIssue: true; specialIssueName: string }
);

// Record<string, YearCatalog> ensures TypeScript knows exact structure
export const TFP_CATALOG: Record<string, YearCatalog> = {
  "2025": {
    issues: [
      { name: "Issue Zero", categoryId: 445 },
      { name: "Issue One", categoryId: 447 },
			{ name: "Issue Two", categoryId: 450 },
      { name: "Issue Three", categoryId: 462 },
      { name: "Issue Three", categoryId: 463 },
    ]
  },
  "2024": {
    hasSpecialIssue: true,
		specialIssueName: "HuEl Guide",
    issues: [
      { name: "Issue Zero", categoryId: 422 },
			{ name: "HuEl Guide – Sem 1", categoryId: 425 },
			{ name: "Issue One", categoryId: 427 },
			{ name: "Issue Two", categoryId: 428 },
			{ name: "Issue Three", categoryId: 437 },
			{ name: "HuEl Guide – Sem 2", categoryId: 438 },
			{ name: "Issue Four", categoryId: 439 },
    ]
  },
	"2023": {
    hasSpecialIssue: true,
		specialIssueName: "HuEl Guide",
    issues: [
			{ name: "HuEl Guide", categoryId: 336 },
      { name: "Issue Zero", categoryId: 334 },
      { name: "Issue One", categoryId: 339 },
			{ name: "Issue Two", categoryId: 340 },
      { name: "Issue Three", categoryId: 409 },
			{ name: "Issue Four", categoryId: 419 },
      { name: "Issue Five", categoryId: 420 },
    ]
  },
	"2022": {
    issues: [
      { name: "Issue Zero", categoryId: 322 },
      { name: "Issue One", categoryId: 314 },
			{ name: "Issue Two", categoryId: 315 },
      { name: "Issue Three", categoryId: 316 },
			{ name: "Issue Four", categoryId: 326 },
			{ name: "Issue Five", categoryId: 329 },
    ]
  },
	"2021": {
    issues: [
      { name: "Issue Zero", categoryId: 304 },
      { name: "Issue One", categoryId: 303 },
			{ name: "Issue Two", categoryId: 305 },
      { name: "Issue Three", categoryId: 309 },
			{ name: "Issue Four", categoryId: 310 },
			{ name: "Issue Five", categoryId: 311 },
    ]
  },
	"2020": {
    issues: [
      // { name: "Issue Zero", categoryId:  }, Issue Zero missing?
      { name: "Issue One", categoryId: 294 },
			{ name: "Issue Two", categoryId: 295 },
      { name: "Issue Three", categoryId: 296 },
      { 
        name: "Issue Four", 
        categoryId: 297, 
        includedArticles: [ 5349, 5376, 5382, 5386 ] // [ Sexual Harassment in Academic Institutions, Sports Secretarial Address, TEDx 2021, Campus Lockdown Update ]
      },
    ]
  },
	"2019": {
    hasSpecialIssue: true,
		specialIssueName: "COVID Issue",
    issues: [
      { name: "Issue Zero", categoryId: 286 },
			{ name: "Issue One", categoryId: 287 },
			{ name: "Issue Two", categoryId: 288 },
      { name: "Issue Three", categoryId: 289 },
			{ name: "Issue Four", categoryId: 290 },
			{ name: "Issue Five", categoryId: 291 },
			{ name: "Issue Six (COVID Issue)", categoryId: 292 },
			// { name: "COVID Issue", categoryId: 293 }, is a duplicate of Issue Six
    ]
  },
	"2018, Sem 2": {
    issues: [
      { name: "Issue One", categoryId: 282 },
			{ name: "Issue Two", categoryId: 283 },
      { name: "Issue Three", categoryId: 284 },
			{ name: "Issue Four", categoryId: 285 },
    ]
  },
	"2018, Sem 1": {
    issues: [
      { name: "Issue One", categoryId: 278 },
			{ name: "Issue Two", categoryId: 279 },
      { name: "Issue Three", categoryId: 280 },
			{ name: "Issue Four", categoryId: 281 },
    ]
  },
	"2017": {
    hasSpecialIssue: true,
		specialIssueName: "Letters",
    issues: [
			{ name: "Issue One", categoryId: 260 },
			{ name: "Issue Two", categoryId: 261 },
      { name: "Issue Three", categoryId: 262 },
			{ name: "Issue Four", categoryId: 263 },
			{ name: "Issue Five", categoryId: 266 },
			{ name: "Issue Six", categoryId: 267 },
			{ name: "Issue Seven", categoryId: 268 },
			{ name: "Issue Eight", categoryId: 269 },
      { name: "Issue Nine", categoryId: 270 },
			{ name: "Issue Ten", categoryId: 271 },
			{ name: "Letters to the Editor", categoryId: 272 },
    ]
  },
};

// For order of cards on screen, as 'Sem 1' 'Sem 2' interferes with Object.keys(TFP_CATALOG).reverse()
export const TFP_YEARS_ORDER = [
  "2025",
  "2024",
  "2023",
  "2022",
  "2021",
  "2020",
  "2019",
  "2018, Sem 2",
  "2018, Sem 1",
  "2017",
];

export const AEP_CATALOG: Record<string, YearCatalog> = {
  /*
  "2026 – The Skeumorph": {
    issues: [
      { name: "Issue Zero (Pre-fest)", categoryId: 469 },
    ]
  },
  */
  "2026 – The Skeumorph": {
    issues: [
      { 
        name: "Issue Zero (Pre-fest)", 
        children: [
          { name: "CoStAA", categoryId: 470 },
          { name: "Departments", categoryId: 471 },
          { name: "Tech Teams, Chapters and Associations", categoryId: 472 },
          { name: "Clubs", categoryId: 473 },
        ]
      },
    ]
  },
  "2025 – Tempora Mutantur": {
    issues: [
      { name: "Issue Zero (Pre-fest)", categoryId: 440 },
    ]
  },
  /*
  "2024": {
    issues: [
      { name: "Issue Zero (Pre-fest)", categoryId: 411 },
    ]
  },
  */
  "2024": {
    issues: [
      { 
        name: "Issue Zero (Pre-fest)", 
        children: [
          { name: "CoStAA", categoryId: 418 },
          { name: "Departments", categoryId: 412 },
          { name: "Tech Teams and Chapters", categoryId: 415 },
          { name: "Associations", categoryId: 416 },
          { name: "Clubs", categoryId: 417 },
        ]
      },
    ]
  },
  "2023": {
    issues: [
      { name: "Issue Zero (Pre-fest)", categoryId: 328 },
    ]
  },
  "2022": {
    issues: [
      { name: "Issue Zero (Pre-fest)", categoryId: 307 },
    ]
  },
  // "2021 – Pressadise Lost", // Issue Zero, Issue One, Issue Two
  "2020 – April Fools Press": {
    issues: [
      { name: "Pre-fest",
        categoryId: 181,
        excludedArticles: [ 5231 ] // [ April Fool’s Press 2020 ]
      },
      {
        name: "Fest Issue",
        categoryId: 0,
        includedArticles: [ 5231 ] // [ April Fool’s Press 2020 ]
      },
    ]
  },
  "2019": {
    issues: [
      { name: "Pre-fest", categoryId: 180 },
      // KnowYourAPOGEE and Speakers, Winning Abstracts from APOGEE 2018
    ]
  },
  "2018": {
    issues: [
      { name: "Pre-fest", categoryId: 179 },
      // What to Expect, Issue One, Issue Two, Issue Three, Winning Abstracts from APOGEE 2017
    ]
  },
  "2017": {
    issues: [
      { name: "Pre-fest", categoryId: 178 },
      // This Day in Tech History
    ]
  },
}

export const AEP_YEARS_ORDER = [
  "2026 – The Skeumorph",
  "2025 – Tempora Mutantur",
  "2024",
  "2023",
  "2022",
  // "2021 – Pressadise Lost",
  "2020 – April Fools Press",
  "2019",
  "2018",
  "2017",
];

export const BEP_CATALOG: Record<string, YearCatalog> = {
  "2025 – The Kinetica": {
    issues: [
      { 
        name: "Issue Zero (Pre-fest)", 
        children: [
          { name: "CoSSAc", categoryId: 452 },
          { name: "Sports Teams", categoryId: 454 },
          { name: "Clubs and Departments", categoryId: 453 },
        ]
      },
    ]
  },
  "2024": {
    issues: [
      { 
        name: "Issue Zero (Pre-fest)", 
        children: [
          { name: "CoSSAc", categoryId: 429 },
          { name: "Sports Teams", categoryId: 432 },
          { name: "Clubs and Departments", categoryId: 431 },
        ]
      },
    ]
  },
  "2023": {
    issues: [
      { name: "Issue Zero (Pre-fest)", categoryId: 344 },
    ]
  },
  "2022": {
    issues: [
      { name: "Issue Zero (Pre-fest)", categoryId: 317 },
    ]
  },
  "2019 – Specktator Mode": {
    issues: [
      {
        name: "Pre-fest",
        categoryId: 209,
        excludedArticles: [ 4020, 3904, 3972, 3910, 4023, 3991, 3980, 3999, 4014, 3988, 3975, 3984, 3995, 4017, 4010, 3941, 3948, 3932, 3925, 3963, 3955, 3914, 3959, 3966 ] // [ Issue 0: Full Version HDCAM, Junoon ’19, BOSM 2050: A Memoire, Inaug Preview, Issue 1: Director’s Cut, Inauguration, Boys’ Basketball Inaugural: BITS P vs. LPU, Chief Guest Interview: Tania Sachdev, Boys’ Volleyball: Manipal vs. JIET, Boys’ Badminton: BITS B vs. MIET, Boys’ Badminton: Venky vs. BKBIET, Boys’ Badminton: BITS A vs. BKBIET, Cricket: SKIT vs. Xavier’s, The Real Reason Cricket isn’t in the Olympics, Issue Two: Full Version 1080p, Boys’ Football: St Xavier’s College Jaipur vs. Ramanujan College, Hockey: BITS vs. BITS Alumni, Boys’ Basketball: BITS P vs. BKBIET, Girls’ Basketball: BITS P vs. BITS H, Girls’ Basketball: SRCC vs. IGIPESS, Carrom: BITS B vs. IIIT Kota, Girls’ Badminton Semifinals: BITS P vs. IIIT Kota, Rotunda Shows, Interview with the sk8rboiz ]
      },
      {
        name: "Issue Zero",
        categoryId: 0,
        includedArticles: [ 4020, 3904, 3972, 3910 ] // [ Issue 0: Full Version HDCAM, Junoon ’19, BOSM 2050: A Memoire, Inaug Preview ]
      },
      {
        name: "Issue One",
        categoryId: 0,
        includedArticles: [ 4023, 3991, 3980, 3999, 4014, 3988, 3975, 3984, 3995, 4017 ] // [ Issue 1: Director’s Cut, Inauguration, Boys’ Basketball Inaugural: BITS P vs. LPU, Chief Guest Interview: Tania Sachdev, Boys’ Volleyball: Manipal vs. JIET, Boys’ Badminton: BITS B vs. MIET, Boys’ Badminton: Venky vs. BKBIET, Boys’ Badminton: BITS A vs. BKBIET, Cricket: SKIT vs. Xavier’s, The Real Reason Cricket isn’t in the Olympics ]
      },
      {
        name: "Issue Two",
        categoryId: 0,
        includedArticles: [ 4010, 3941, 3948, 3932, 3925, 3963, 3955, 3914, 3959, 3966 ] // [ Issue Two: Full Version 1080p, Boys’ Football: St Xavier’s College Jaipur vs. Ramanujan College, Hockey: BITS vs. BITS Alumni, Boys’ Basketball: BITS P vs. BKBIET, Girls’ Basketball: BITS P vs. BITS H, Girls’ Basketball: SRCC vs. IGIPESS, Carrom: BITS B vs. IIIT Kota, Girls’ Badminton Semifinals: BITS P vs. IIIT Kota, Rotunda Shows, Interview with the sk8rboiz ]
      }
    ]
  },
  "2018": {
    issues: [
      { name: "Pre-fest", categoryId: 208 },
    ]
  },
  "2017": {
    issues: [
      { name: "Pre-fest", categoryId: 203 },
      // Match Reports, Communication Breakdown
    ]
  },
  "2016": {
    issues: [
      { name: "Pre-fest", categoryId: 200 },
      // Matches
    ]
  },
}

export const BEP_YEARS_ORDER = [
  "2025 – The Kinetica",
  "2024",
  "2023",
  "2022",
  "2019 – Specktator Mode",
  "2018",
  "2017",
  "2016",
];

export const OEP_CATALOG: Record<string, YearCatalog> = {
  "2025 – The Shiverline": {
    issues: [
      { 
        name: "Issue Zero (Pre-fest)", 
        children: [
          { name: "StuCCA", categoryId: 456 },
          { name: "Departments", categoryId: 459 },
          { name: "Clubs and Associations", categoryId: 460 },
        ]
      },
    ]
  },
  "2024": {
    issues: [
      { 
        name: "Issue Zero (Pre-fest)", 
        children: [
          { name: "StuCCA", categoryId: 434 },
          { name: "Departments", categoryId: 435 },
          { name: "Clubs and Associations", categoryId: 436 },
        ]
      },
    ]
  },
  "2023": {
    issues: [
      { 
        name: "Issue Zero (Pre-fest)", 
        children: [
          { name: "StuCCA and CRC", categoryId: 348 },
          { name: "Departments", categoryId: 360 },
          { name: "Clubs and Associations", categoryId: 368 },
        ]
      },
    ]
  },
  "2022": {
    issues: [
      { name: "Issue Zero (Pre-fest)", categoryId: 325 },
    ]
  },
  "2019 – The Penning Effect": {
    issues: [
      {
        name: "Pre-fest",
        categoryId: 226,
        excludedArticles: [ 4389, 4405, 4410, 4436, 4431, 4426, 4472, 4468, 4455, 4460, 4464, 4581, 4491, 4503, 4495, 4499, 4509, 4598 ] // [ OEP'19 Issue Zero, Musings on Neon Noir, OEP'19 Issue One, Interview with Madhur Bhandarkar, Inauguration Review, BITS Pilani: The Neon to Pilani's Noir, OEP'19 Issue Two, Stage Play – Part One, Neon Noir: Neighbourhood Hot Takes, The Oasis Talk: Imtiaz Ali, Protest Out Of Waste, OEP'19 Issue Three, Sukhmanch Theatre, Oasis Quiz, Stage Play – Part Two, Street Play, Mr and Ms Oasis, OEP'19 Issue Four ]
      },
      {
        name: "Issue Zero",
        categoryId: 0,
        includedArticles: [ 4389, 4405 ] // [ OEP'19 Issue Zero, Musings on Neon Noir ]
      },
      {
        name: "Issue One",
        categoryId: 0,
        includedArticles: [ 4410, 4436, 4431, 4426 ] // [ OEP'19 Issue One, Interview with Madhur Bhandarkar, Inauguration Review, BITS Pilani: The Neon to Pilani's Noir ]
      },
      {
        name: "Issue Two",
        categoryId: 0,
        includedArticles: [ 4472, 4468, 4455, 4460, 4464 ] // [ OEP'19 Issue Two, Stage Play – Part One, Neon Noir: Neighbourhood Hot Takes, The Oasis Talk: Imtiaz Ali, Protest Out Of Waste ]
      },
      {
        name: "Issue Three",
        categoryId: 0,
        includedArticles: [ 4581, 4491, 4503, 4495, 4499, 4509 ] // [ OEP'19 Issue Three, Sukhmanch Theatre, Oasis Quiz, Stage Play – Part Two, Street Play, Mr and Ms Oasis ]
      },
      {
        name: "Issue Four",
        categoryId: 0,
        includedArticles: [ 4598 ] // [ OEP'19 Issue Four ]
      }
    ]
  },
  "2018 – Memento Mori": {
    issues: [
      { name: "Pre-fest", categoryId: 225 },
    ]
  },
  "2017": {
    issues: [
      { name: "Pre-fest", categoryId: 224 },
    ]
  },
  "2016 – Mythology": {
    issues: [
      { name: "Pre-fest", categoryId: 223 },
    ]
  },
}

export const OEP_YEARS_ORDER = [
  "2025 – The Shiverline",
  "2024",
  "2023",
  "2022",
  "2019 – The Penning Effect",
  "2018 – Memento Mori",
  "2017",
  "2016 – Mythology",
];