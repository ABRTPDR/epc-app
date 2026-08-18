/* VERY VERY IMPORTANT:
WP category IDs MUST be reused in at least one of its category/subcategory definitions
For example, see "AEP 2020" below, where instead of making "APOGEE 2020: The Glitch Repository" have categoryId=0 and then includedArticles, it takes own parent's ID then excludedArticles
Else, glitches out filtering by press category when searching for articles in-app
*/

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
  "2026": {
    issues: [
      { name: "Issue Zero", categoryId: 476 },
    ]
  },
  "2025": {
    issues: [
      { name: "Issue Zero", categoryId: 445 },
      { name: "Issue One", categoryId: 447 },
			{ name: "Issue Two", categoryId: 450 },
      { name: "Issue Three", categoryId: 462 },
      { name: "Issue Four", categoryId: 463 },
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
      { 
        name: "Psenti-Speaks", 
        categoryId: 0, 
        includedArticles: [ 9592, 9605, 9624, 9838, 9844 ] // [ Psenti-Speak: Aditya H Iyer, Psenti-Speak: Aditi Chandramoulee, Psenti-Speak: Akshatha Sabaji, Psenti-Speak: Harshita Yadav, Psenti-Speak: Aditya Gupta ]
      },
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
      { 
        name: "Issue Five", 
        categoryId: 266, 
        excludedArticles: [ 1792 ] // [ Yours in Exasperation – 3 ]
      },
			{ name: "Issue Six", categoryId: 267 },
			{ name: "Issue Seven", categoryId: 268 },
			{ name: "Issue Eight", categoryId: 269 },
      { name: "Issue Nine", categoryId: 270 },
			{ name: "Issue Ten", categoryId: 271 },
      { 
        name: "Letters to the Editor", 
        categoryId: 272, 
        includedArticles: [ 1792 ] // [ Yours in Exasperation – 3 ]
      },
    ]
  },
};

// For order of cards on screen, as 'Sem 1' 'Sem 2' interferes with Object.keys(TFP_CATALOG).reverse()
export const TFP_YEARS_ORDER = [
  "2026",
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
  "2026 – The Skeuomorph": {
    issues: [
      { name: "Issue Zero (Pre-fest)", categoryId: 469 },
    ]
  },
  */
  "2026 – The Skeuomorph": {
    issues: [
      { 
        name: "Pre-fest", 
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
      /*
      { name: "Pre-fest",
        categoryId: 181,
        excludedArticles: [ 5231 ] // [ April Fool’s Press 2020 ]
      },
      */
      { name: "Pre-fest",
        children: [
          { name: "Speakers", categoryId: 0, includedArticles: [ 4806, 4812 ] }, // [ Zainab Nagin Cox, Zed A. Shaw ]
          { name: "APOGEE 2020: The Glitch Repository", categoryId: 181, excludedArticles: [ 5231, 4806, 4812 ] }, // Remaining articles excluding above and below
        ]
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
      /*
      { name: "Pre-fest", categoryId: 180 },
      */
      {
        name: "Pre-fest",
        children: [
          { name: "What to Expect", categoryId: 0, includedArticles: [ 3372 ] }, // [ Kernel Events ]
          { name: "KnowYourAPOGEE", categoryId: 0, includedArticles: [ 3276, 3282, 3291, 3294, 3299 ] }, // [ Papyrus Trails, KnowYourAPOGEE: The First One, KnowYourAPOGEE: 1989, KnowYourAPOGEE: An Eventful Summary, KnowYourAPOGEE: Speakers and Shows ]
          { name: "Speakers", categoryId: 0, includedArticles: [ 3102, 3138, 3144, 3147, 3150, 3268, 3272 ] }, // [ Ashwin Sanghi, Rakesh Sharma, Vikramaditya Motwane, Alan Emtage, Arun Shourie, Lt Gen. S.S. Hasabnis, Stephen P. Morse ]
          { name: "CoStAA", categoryId: 0, includedArticles: [ 3356, 3350, 3332, 3344, 3347, 3353, 3365, 3359, 3362 ]}, // [ President – Satyansh Rai, GenSec – Akash Singh, ADP – Aditya Pawar, Controls – Apoorv Saxena, DVM – Megh Thakkar, PCr-APOGEE – Parv Panthari, PEP – Anirudh Singla, RecN’Acc – Yatharth Singh, Sponz – Anushka Pathak ]
          { name: "Winning Abstracts from APOGEE 2018", categoryId: 180, excludedArticles: [ 3372, 3276, 3282, 3291, 3294, 3299, 3102, 3138, 3144, 3147, 3150, 3268, 3272, 3356, 3350, 3332, 3344, 3347, 3353, 3365, 3359, 3362 ]}, // Remaining articles excluding above
        ]
      }
    ]
  },
  "2018": {
    issues: [
      /*
      { name: "Pre-fest", categoryId: 179 },
      */
      {
        name: "Pre-fest",
        children: [
          { name: "Pre-APOGEE", categoryId: 0, includedArticles: [ 1835 ] }, // [ TEDx 2018 ]
          { name: "What to Expect", categoryId: 0, includedArticles: [ 1965, 2031, 1934, 1840, 2027, 1979 ] }, // [ Kernel Events, Event Descriptions, Speakers in APOGEE 2018, Exhibitions, Paper Presentation Guide, Project Presentation Guide ]
          { name: "APOGEE 2018: A Cybernetic Vision", categoryId: 0, includedArticles: [ 1953, 1957, 1975 ] }, // [ The Master Race To Colonisation, The Replacement Argument, Consequences of Planet Colonisation ]
          { name:"CoStAA", categoryId: 0, includedArticles: [ 1999, 1990, 2002, 1983, 1993, 2012, 2009, 1996, 2006 ] }, // [ President – Bharatharatna Puli, General Secretary – Shivam Jindal, ADP – Vaibhav Jain, Controls – Himangshu Baid, DVM – Hitesh Raghuvanshi, PCr APOGEE – Alanckrit Jain, PEP – Abhishek Gupta, RecNAcc – Anshuman Sharma, Sponz – Keshav Jain ]
          { name: "Winning Abstracts from APOGEE 2017", categoryId: 179, excludedArticles: [ 1835, 1965, 2031, 1934, 1840, 2027, 1979, 1953, 1957, 1975, 1999, 1990, 2002, 1983, 1993, 2012, 2009, 1996, 2006, 2044, 2046, 2048, 2050, 2052, 2054, 2056, 2074, 2058, 2060, 2071, 2076, 2066, 2068 ] }, // Remaining articles except above and below
        ]
      },
      {
        name: "Issue One",
        categoryId: 0,
        includedArticles: [ 2044, 2046, 2048, 2050, 2052, 2054, 2056 ], // [ Inauguration : A Review, Overhead Transmission : A Review, The Local Train : A Preview, Mitra : The Indigenous Robot, NAO Bot, David Stork : A Preview, Peek – Ta – Boo! ]
      },
      {
        name: "Issue Two",
        categoryId: 0,
        includedArticles: [ 2074, 2058, 2060, 2071, 2076 ], // [ The Local Train, Chief Guest Interview (Cmdre Indrajit Dasgupta), India Quiz, E-Summit: Dr. Anil Kumar Gupta, Talk by Mr. Vishal Kamat ]
      },
      {
        name: "Issue Three",
        categoryId: 0,
        includedArticles: [ 2066, 2068 ], // [ Jeopardy, Danielle Feinberg: A Preview ]
      }
    ]
  },
  "2017": {
    issues: [
      /*
      { name: "Pre-fest", categoryId: 178 },
      */
      {
        name: "Pre-fest",
        children: [
          { name: "Pre-APOGEE", categoryId: 0, includedArticles: [ 334, 338 ] }, // [ BITSMUN 2017, QED 2017 ]
          { name: "APOGEE 2017: The RetroFuture", categoryId: 0, includedArticles: [ 199, 205, 207, 321, 324, 339 ] }, // [ Maxwell’s Demon, A Petition for Women Empowerment, Retrofuturism in Infinite Jest, Genetic Engineering, Gender Fluidity, Retrofuturism in Bioshock ]
          { name: "This Day in Tech History", categoryId: 0, includedArticles: [ 23, 39, 58, 90, 104, 118, 143, 162, 182, 216, 237, 251, 276, 282, 296, 309, 342, 352, 364, 376, 388 ] }, // [ February 3rd, February 4th, February 5th, February 6th, February 7th, February 8th, February 9th, February 10th, February 11th, February 12th, February 13th, February 14th, Feburary 16th, Feburary 17th, February 18th, February 19th, February 20th, February 21st, February 22nd, February 23rd, February 24th ]
          { name: "CoStAA", categoryId: 0, includedArticles: [ 462, 466, 468 ] }, // [ DVM – An Interview, PCr (APOGEE) – An Interview, PEP – An Interview ]
          { name: "Departments", categoryId: 0, includedArticles: [ 424, 422, 426, 464 ] }, // [ DExA – An Interview, DLE – An Interview, DoPy – An Interview, Informalz – An Interview,  ]
          { name: "Tech Teams, Chapters and Associations", categoryId: 178, excludedArticles: [ 334, 338, 199, 205, 207, 321, 324, 339, 23, 39, 58, 90, 104, 118, 143, 162, 182, 216, 237, 251, 276, 282, 296, 309, 342, 352, 364, 376, 388, 462, 466, 468, 424, 422, 426, 464, 409, 421, 429, 431, 434, 439, 444, 446, 459 ] }, // Remaining articles excluding above and below
          { name: "Clubs", categoryId: 0, includedArticles: [ 409, 421, 429, 431, 434, 439, 444, 446, 452, 459 ] }, // [ The Astro Club – An Interview, Dance Club – An Interview, Gaming Club – An Interview, HAS – An Interview, Photog – An Interview, AHP – An Interview, Gurukul – An Interview, Nirmaan – An Interview, Coding Club – An Interview, FMaC – An Interview ]
        ]
      }
    ]
  },
}

export const AEP_YEARS_ORDER = [
  "2026 – The Skeuomorph",
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
          { name: "CoSSAc and SFC", categoryId: 452 },
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
          { name: "CoSSAc and SFC", categoryId: 429 },
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
  "2018 – Gegenpress": {
    issues: [
      { name: "Pre-fest", categoryId: 208 },
    ]
  },
  "2017 – Communication Breakdown": {
    issues: [
      /*
      { name: "Pre-fest", categoryId: 203 },
      */
      {
        name: "Pre-fest",
        categoryId: 203,
        excludedArticles: [ 1222, 1227, 1230, 1233, 1257, 1253, 1245, 1248, 1251, 1259, 1261, 1241, 1243, 1269, 1264, 1272, 1266, 1274, 1281 ], // Remaining articles excluding below
      },
      {
        name: "Issue Zero",
        categoryId: 0,
        includedArticles: [ 1222, 1227 ], // [ BOSM – A rundown, BOSM for the non-sports person ]
      },
      {
        name: "Issue One",
        categoryId: 0,
        includedArticles: [ 1230, 1233, 1257, 1253, 1245, 1248, 1251 ], // [ Interview with the Chief Guest, (Volleyball Boys’ BITS A vs MRIU – 21 September 2017, 9:45 PM), Snooker – BITS vs. GSB, Tennis Boys’ – BITS Pilani A vs. Manipal, Hockey – BITS vs BITS Alumni, Boys’ Basketball – BITS Pilani vs. BITS Goa, Squash – Manipal vs. BITS A,  ]
      },
      {
        name: "Issue Two",
        categoryId: 0,
        includedArticles: [ 1259, 1261, 1241, 1243 ], // [ Tanvie Hans – A talk and an interview, Rotunda Events, Boys’ Football – BITS vs. GSB, Girls’ Football – BITS vs. MODY Univ., ]
      },
      {
        name: "Issue Three",
        categoryId: 0,
        includedArticles: [ 1269, 1264, 1272, 1266, 1274 ], // [ Squash – BITS A vs. IIT Delhi, Lawn Tennis Girls, Boys’ Football – BITS vs. Venky’s, Taekwondo, Chess – Match Showcase ]
      },
      {
        name: "Issue Four",
        categoryId: 0,
        includedArticles: [ 1281 ], // [ BOSM – An Ode To The Future ]
      },
    ]
  },
  "2016 – Calvinball": {
    issues: [
      /*
      { name: "Pre-fest", categoryId: 200 },
      */
      {
        name: "Pre-fest",
        categoryId: 0,
        includedArticles: [ 653, 100, 103, 114, 125, 655, 137, 142, 147, 154, 158, 175, 180, 183, 201, 204 ], // [ BOSM of the Future, Tennis, Table Tennis: Ball Crushers, Swimming (Girls), Powerlifting, Badminton (Boys), Badminton (Girls), Hockey, Athletics, Cricket, Basketball (Boys), Basketball (Girls), Carrom: More to it than flicking, Football (Girls): History in the Making, Volleyball (Girls): Sharing the court, sharing the sport, Taekwondo ]
      },
      {
        name: "Matches",
        categoryId: 200,
        excludedArticles: [ 653, 100, 103, 114, 125, 655, 137, 142, 147, 154, 158, 175, 180, 183, 201, 204 ], // Remaining articles excluding above
      },
      {
        name: "Fest Issues",
        categoryId: 0,
        includedArticles: [ 52, 643 ] // [ What is Calvinball?, About (a long, philosophical introduction to BEP) ]
      },
    ]
  },
}

export const BEP_YEARS_ORDER = [
  "2025 – The Kinetica",
  "2024",
  "2023",
  "2022",
  "2019 – Specktator Mode",
  "2018 – Gegenpress",
  "2017 – Communication Breakdown",
  "2016 – Calvinball",
  // "2015 – Zlatanera",
  // "2014 – Zeitgeist",
  // "2012 – Ten",
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
        excludedArticles: [ 4389, 4405, 4410, 4436, 4431, 4426, 4472, 4468, 4455, 4460, 4464, 4581, 4491, 4503, 4495, 4499, 4509, 4598 ] // Remaining articles excluding below
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
      /*
      { name: "Pre-fest", categoryId: 225 },
      */
      {
        name: "Pre-fest",
        children: [
          { name: "Oasis 2018: The Far Out Fest", categoryId: 0, includedArticles: [ 2577, 2595, 2618, 2627, 2631 ] }, // [ Ghosts of Oases Past, Origin Story: The Peace Symbol, Origin Story: 420, The Madrid Scene, Jejemon ]
          { name: "StuCCA", categoryId: 0, includedArticles: [ 2798, 2752, 2746, 2749, 2784, 2790, 2781, 2795 ] }, // [ President, General Secretary, (Art, Design, & Publicity), Sponsorship & Marketing, Publications and Correspondence, Department of Visual Media, Controls, Reception & Accommodation ]
          { name: "Departments", categoryId: 0, includedArticles: [ 2718, 2722, 2733, 2724, 2727, 2736, 2730 ] }, // [ Informalz, Audi Force, Firewallz, Department of Live Events, Department of Photography, Stage Controls, Department of Theatre ]
          { name: "Clubs and Associations", categoryId: 225, excludedArticles: [ 2577, 2595, 2618, 2627, 2631, 2798, 2752, 2746, 2749, 2784, 2790, 2781, 2795, 2718, 2722, 2733, 2724, 2727, 2736, 2730, 2812, 2814, 2816, 2835, 2840, 2842, 2844, 2847, 2849, 2851, 2853, 2855, 2857, 2859, 2861, 2863, 2867, 2871, 2874, 2876, 2878, 2881, 2883, 2885, 2887, 2888, 2890, 2892, 2894, 2896, 2898, 2900, 2903, 2905, 2907, 2909, 2911, 2913, 2915 ] }, // Remaining articles excluding above and below
        ]
      },
      {
        name: "Issue Zero",
        categoryId: 0,
        includedArticles: [ 2812, 2814, 2816 ], // [ The Road To Oasis, History of the Hall of Fame, Film Festival ]
      },
      {
        name: "Issue One",
        categoryId: 0,
        includedArticles: [ 2835, 2840, 2842 ], // [ Oasis Quiz, Prof Shows: A Preview, Hall of Fame: Jack Kerouac ]
      },
      {
        name: "Issue Two",
        categoryId: 0,
        includedArticles: [ 2844, 2847, 2849, 2851, 2853, 2855, 2857, 2859, 2861, 2863, 2867 ], // [ Inauguration Ceremony: A Review, BLAB: A Review, Rap Wars: A Review, Tango Night: A Review, Guthrie Govan: A Review, (Beg, Borrow, Steal), Stage Play: Day 1, Counterculture Hall of Fame: Paul Krassner, An Interview With Abhishek Chaubey, Food Stalls: A Comprehensive Menu, How To Score This Oasis: A Deterministic Freakin’ Automaton ]
      },
      {
        name: "Issue Three",
        categoryId: 0,
        includedArticles: [ 2871, 2874, 2876, 2878, 2881, 2883, 2885, 2887, 2888, 2890, 2892, 2894, 2896, 2898 ], // [ Tarang: A Review, Axetacy: A Review, Choreo: A Review, Desert Duel, Entertainment Quiz, Filmy Muqabala, Hindi Prof Show, An Interview with IndoSoul, IndoSoul: A Review, Nomad: An Interview With A Travel Blogger, Stage Play: Day 2, Street Play, Treasure Hunt, Tambola Tales ]
      },
      {
        name: "Issue Four",
        categoryId: 0,
        includedArticles: [ 2900, 2903, 2905, 2907, 2909, 2911, 2913, 2915 ], // [ EDM Night, Hall of Fame: Bob Marley, Hansraj Projekt/Sab-Culture: An Interview, Mock Parliament, Diary of a First Year: From the Press, Razzmatazz: A Review, Rocktaves: A Review, Street Dance: A Review ]
      },
    ]
  },
  "2017": {
    issues: [
      /*
      { name: "Pre-fest", categoryId: 224 },
      */
      {
        name: "Pre-fest",
        children: [
          { name: "Oasis 2017: Realms of Fiction", categoryId: 0, includedArticles: [ 1289, 1305, 1309, 1314, 1428, 1443, 1448, 1486 ] }, // [ Reality Stranger Than Fiction? Try Again., Sin City, Life Is Strange: The Game (And the cultural revolution it hints at), Plays in the Modern World, Realms of Fiction, Horsing Around, On the Evolution and Appeal of Manga, Music and Films ]
          { name: "StuCCA and CRC", categoryId: 0, includedArticles: [ 1671, 1588, 1682, 1529, 1534, 1570, 1638, 1595, 1659 ] }, // [ Prez, GenSec, ADP, Sponz, Controls, DVM, PCr, Rec’n’Acc, CRC ]
          { name: "Departments", categoryId: 0, includedArticles: [ 1490, 1498, 1504, 1508, 1545, 1579, 1648, 1663, 1668 ] }, // [ Audi Force, DoT, Informalz, Lights, Sounds, Firewallz, DoPy, Backstage, DLE ]
          { name: "Clubs and Associations", categoryId: 224, excludedArticles: [ 1289, 1305, 1309, 1314, 1428, 1443, 1448, 1486, 1671, 1588, 1682, 1529, 1534, 1570, 1638, 1595, 1659, 1490, 1498, 1504, 1508, 1545, 1579, 1648, 1663, 1668 ] }, // Remaining articles excluding above
        ]
      },
    ]
  },
  "2016 – Mythology": {
    issues: [
      /*
      { name: "Pre-fest", categoryId: 223 },
      */
      {
        name: "Pre-fest",
        children: [
          { name: "Oasis 2016: Of Gods and Men", categoryId: 0, includedArticles: [ 763, 765, 767, 757, 759, 761, 769 ] }, // [ The Oedipus Complex, Should I Care About Mythology Today, Mercy Or Misery – The Impetus Of The Gods, Broadway Refuted – The Stage Where it Never Happened, Broadway Refuted – The Stage Where it Happened, (The Theseus Paradox- If Gods change with the times, are they the same), Led Zeppelin- The Hammer of the Gods ]
          { name: "StuCCA", categoryId: 0, includedArticles: [ 796, 833, 835, 842, 844, 846, 849, 853 ] }, // [ General Secretary – Manas Luthra, (Department of Art, Design and Publicity), Department of Controls, Department of Publications and Correspondence, Department of Reception and Accommodation, Department of Sponsorship and Marketing, Department of Stage Controls, Department of Visual Media ]
          { name: "Departments", categoryId: 0, includedArticles: [ 838, 851, 779, 794, 816, 840 ] }, // [ Department of Live Events, Department of Theatre, Informalz, Firewallz, Sounds, Department Of Photography ]
          { name: "Clubs and Associations", categoryId: 223, excludedArticles: [ 763, 765, 767, 757, 759, 761, 769, 796, 833, 835, 842, 844, 846, 849, 853, 838, 851, 779, 794, 816, 840, 771, 773 ] }, // Remaining articles excluding above
        ]
      },
      {
        name: "Fest Issues",
        categoryId: 0,
        includedArticles: [ 771, 773 ] // [ Oasis Through The Ages, An Open Discussion With Amish Tripathi ]
      },
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

export interface CFIssue {
  year: string;
  driveUrl: string;
}

export const CF_ISSUES: CFIssue[] = [
  { year: '2020 Issue Two', driveUrl: 'https://drive.google.com/file/d/17UCuzeSMMzMH4x4vDuD1rb9E1Jg6-ux5/view?usp=drive_link' },
  { year: '2020 Issue One', driveUrl: 'https://drive.google.com/file/d/18KL-Fv62wNkDnbBmT-oPiJGUb2fJ-CH_/view?usp=drive_link' },
  { year: '2019', driveUrl: 'https://drive.google.com/file/d/1JBt9XUSwuEL61MeD6XsvFJfWpWRpHbKN/view?usp=drive_link' },
  { year: '2017', driveUrl: 'https://drive.google.com/file/d/1KaDrcSScQ-MrjaceYdNrTApjh3DRmULr/view?usp=drive_link' },
  { year: '2014', driveUrl: 'https://drive.google.com/file/d/1DtH-W2N5YnoHVyGaIxO3ixHNyD25zSgq/view?usp=drive_link' },
  { year: '2012', driveUrl: 'https://drive.google.com/file/d/15oZhdXxsdDKICxrs5YyhhAyHTGFQvNvr/view?usp=drive_link' },
  { year: '2011', driveUrl: 'https://drive.google.com/file/d/1m6-mcXJhW85rW2rlON72d0yrF65ngQ7B/view?usp=drive_link' },
  { year: '2006', driveUrl: 'https://drive.google.com/file/d/1p9-J3on_JuwXYAgaibhuPgwNagBRPqVp/view?usp=drive_link' },
  { year: '2005', driveUrl: 'https://drive.google.com/file/d/1BsWucDbhiWZxLYmpJ8VIUiVVVhNhdOzB/view?usp=drive_link' },
  { year: '1998', driveUrl: 'https://drive.google.com/file/d/1-figwpuu72u7y6EgptOnu0ldslSwzir-/view?usp=drive_link' },
  { year: '1997', driveUrl: 'https://drive.google.com/file/d/1ug1ga3DqKbaOZYkp36IpUnnBzLYNLCD_/view?usp=drive_link' },
  { year: '1996', driveUrl: 'https://drive.google.com/file/d/1Zs2rC1JHcM8UIiOCWwI6l-7o_y24Q1hG/view?usp=drive_link' },
  { year: '1995', driveUrl: 'https://drive.google.com/file/d/1RBz0CJaFcTDeY5ihNV1GjIrBxm8XKhfc/view?usp=drive_link' },
  { year: '1992', driveUrl: 'https://drive.google.com/file/d/1BMVqS3MgCsqmCguAgDITC8ZJLbovUxMm/view?usp=drive_link' },
  { year: '1991', driveUrl: 'https://drive.google.com/file/d/1U23y2sIcIVLXHwjN4mM7eqWWNuJ9OauJ/view?usp=drive_link' },
  { year: '1989', driveUrl: 'https://drive.google.com/file/d/1IIdhYcWLbADhnr1J2IJQhdsIuE9yzzD0/view?usp=drive_link' },
  { year: '1984', driveUrl: 'https://drive.google.com/file/d/11Yw938c7RyZxNDDXNQ2OJtW0pu7WUkuO/view?usp=drive_link' },
  { year: '1983', driveUrl: 'https://drive.google.com/file/d/1yInBTu5copgQn_fIt1tN7jRIV4Yykmgk/view?usp=drive_link' },
];