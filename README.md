# Friend Schedule Sync

Build a mobile-friendly web app called "Schedule Sync" for a group of 6 high school friends to view each other's class schedules and find overlapping free periods.

DATA — hardcode this as a JS array/object in the app (no backend needed):

STUDENT 1: Abel Nielsen

Per 01 | 8:10-8:52 AM | English 9 | Graham, Sally | Rm 2220

Per 02 | 8:57-9:39 AM | Study Hall (Mon/Thu) or Biology (Tue/Fri) | Przekota / Serafini | Rm 3160 / 2405

Per 03 | 9:44-10:26 AM | Biology (Mon/Thu) or Study Hall (Tue/Fri) | Serafini / Przekota | Rm 2405 / 3160

HR | 10:31-10:41 AM | Homeroom | White, Tenesha | Rm 3155

Per 04 | 10:46-11:28 AM | Modern World History | Lapin, Maxine | Rm 3130

Per 05 | 11:33 AM-12:15 PM | Alg 1 | Bartels, Suzanne | Rm 3195

Per 06 | 12:20-1:02 PM | Lunch | Staff | Cafe

Per 07 | 1:07-1:49 PM | Physical Ed 9 | Wittleder, William | Gym

Per 08 | 1:54-2:36 PM | Concert Orchestra | Frakes, Natalie | Rm 1705

Per 09 | 2:41-3:23 PM | AVID 09 | Heller, Lisa | Rm 2150

STUDENT 2: Jackson Tritt

Per 01 | English 9 | Stosovic, Tijana | Rm 2225

Per 02 | Modern World History | Kokoris, Christina | Rm 2235

Per 03 | Lunch | Staff | Cafe

HR | Homeroom | Guerin, Tyler | Rm 1175

Per 04 | Biology Hon | Fortune, Kathleen | Rm 2420

Per 05 | Biology Hon (Wed/Fri) or Study Hall (Mon/Tue/Thu) | Fortune / — | Rm 2420 / So Lobby

Per 06 | AVID 09 | Heller, Lisa | Rm 2150

Per 07 | Alg 1 | Bressler, Kathleen | Rm 3215

Per 08 | Concert Orchestra | Frakes, Natalie | Rm 1705

Per 09 | Physical Ed 9 | Reynolds, Nicole | Gym

STUDENT 3: Alexander King

Per 01 | Physical Ed 9 | Moran, Thomas | Gym

Per 02 | Business & Tech 1 | Lastovich, John | Rm 1505

Per 03 | English 9 | Ukomadu, Tenesha | Rm 1160

HR | Homeroom | Cherry, Jonda L | Rm 1185

Per 04 | Lunch | Staff | Cafe

Per 05 | Philharmonic Orchestra | Frakes, Natalie | Rm 1705

Per 06 | Alg 1 | Bartels, Suzanne | Rm 3195

Per 07/08 | Biology Hon | Page, Michael | Rm 1410

Per 08 (Mon/Thu) | Study Hall | — | So Lobby

Per 09 | Modern World History | Williams, Preston | Rm 3120

STUDENT 4: Usman Maniya

Per 01 | Modern World History | Reyes, Martin | Rm 3120

Per 02 | English 9 | Graham, Sally | Rm 2220

Per 03 | Automotive Technology 1 | Thomas, Kyle | Rm 1523

HR | Homeroom | Wiemer, Matthew | —

Per 04 | Biology Hon | Fortune, Kathleen | Rm 2420

Per 05 | Study Hall (varies by day) | — | So Lobby

Per 06 | Lunch | Staff | Cafe

Per 07 | Physical Ed 9 | Reynolds, Nicole | Gym

Per 08 | Alg 1 | Vana, John | Rm 3180

Per 09 | AP Computer Science Principles | Mosier, Amber | Rm 1300

STUDENT 5: Aasim Ali

Per 01 | Biology | Rankic, Sandra | Rm 2405

Per 02 | Study Hall (Mon/Tue/Thu) or Biology (Wed/Fri) | — / Rankic | So Lobby (1750) / Rm 2405

Per 03 | Business & Tech 1 | Lastovich, John | Rm 1505

HR | Homeroom | Williams, Preston | —

Per 04 | Modern World History | Torres, Paul | Rm 3005

Per 05 | English 9 | Feiereisel, Ronald | Rm 1025

Per 06 | Lunch | Staff | Cafe

Per 07 | Physical Ed 9 | Reynolds, Nicole | Gym

Per 08 | Alg 1 | Vana, John | Rm 3180

Per 09 | Spanish 2 | Travis, Emma | Rm 3140

STUDENT 6: Aaron Powell

Per 01 | English 9 | Iqbal, Saima | Rm 1199

Per 02 | Physical Ed 9 | Moran, Thomas | Gym

Per 03 | Lunch | Staff | Cafe

HR | Homeroom | Block, Matthew | —

Per 04 | IED-PLTW | Pros, Christopher | Rm 1520

Per 05 | AP World History: Modern | Johnson, Melanie | Rm 2035

Per 06 | Alg 2 Hon | Rauser, Lynne | Rm 3185

Per 07 | Biology Hon | Page, Michael | Rm 1410

Per 08 | Biology Hon (Wed/Fri) or Frosh Study Hall (Mon/Tue/Thu) | Page / — | Rm 1410 / So Lobby

Per 09 | French 1 | Nimtz, Catherine | Rm 3010

FEATURES TO BUILD:

1. Home page: grid of 6 friend cards (name only), click a card to see that friend's full daily schedule as a clean table (period, time if available, class, teacher, room).

2. "Free Period Finder" page: a matrix/grid showing all 6 friends across periods 01-09 + HR, color-coded — green if the friend has Lunch or Study Hall that period (free), red if in class. Highlight periods where 2+ friends are free at the same time.

3. "Class Overlap" page: for a selected class period, show which friends share the same class/teacher (e.g. everyone with Alg 1 together, everyone with Physical Ed together).

4. Use Abel Nielsen's time blocks as the reference bell schedule for displaying approximate real clock times next to period numbers for all students, since they attend the same school.

5. Clean, simple mobile-first UI. Use a card-based layout, sans-serif font, one accent color (dark red, matching the school's branding). No login system needed — this is just for personal/friend use.

6. Add a note that Wednesday has a shortened/shifted schedule (starts later, compressed periods) — don't need exact Wednesday times unless easily inferable, just flag it.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://friend-period-finder.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/574426df-efa2-4cf8-b90d-215c640d442b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
