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
  { year: '2013', driveUrl: 'https://drive.google.com/file/d/1ZC7UZbtHzJS14-gSC2jhFTOx9L-g_VCv/view?usp=drive_link' },
  { year: '2012', driveUrl: 'https://drive.google.com/file/d/15oZhdXxsdDKICxrs5YyhhAyHTGFQvNvr/view?usp=drive_link' },
  { year: '2011', driveUrl: 'https://drive.google.com/file/d/1m6-mcXJhW85rW2rlON72d0yrF65ngQ7B/view?usp=drive_link' },
  { year: '2010', driveUrl: 'https://drive.google.com/file/d/1BS9_sPiOvTeiKGZAWZxs-8QBnARuY7KH/view?usp=drive_link' },
  { year: '2008', driveUrl: 'https://drive.google.com/file/d/1WaUMojegVsc7QcVUmU-Kgf-YtSrR6lkN/view?usp=drive_link' },
  { year: '2007', driveUrl: 'https://drive.google.com/file/d/1jKu5F0Vg6C-Yc-ugNx1mQM0lWz-2uvXK/view?usp=drive_link' },
  { year: '2006', driveUrl: 'https://drive.google.com/file/d/1p9-J3on_JuwXYAgaibhuPgwNagBRPqVp/view?usp=drive_link' },
  { year: '2005', driveUrl: 'https://drive.google.com/file/d/1BsWucDbhiWZxLYmpJ8VIUiVVVhNhdOzB/view?usp=drive_link' },
  { year: '2003', driveUrl: 'https://drive.google.com/file/d/1w--k4pEC-en70LWKDiZbUjQu1VBxqpoW/view?usp=drive_link' },
  { year: '2000', driveUrl: 'https://drive.google.com/file/d/1cg4_zMOJoZiuU-YJypySnIVnC_6eOVjK/view?usp=drive_link' },
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