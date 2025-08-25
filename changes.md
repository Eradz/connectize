- migrated to react-router-v7
- removed the 34mb cities json and used an api instead

-
- Completed the migration to react-router-v7

- merged all changes from react-router-v7 mirgration to the current state of main.
- Updated all <SEO /> call to the react router v7 pattern
- added <Links /> to the root layout to load css during build time
- Fixed the undefined showing in the download post feature in home page

- Made the height for products and services in the slider in home page have even/the same height.

-

- The login page no longer loads the notification.jsx and Discoverposts.jsx chunks which reduce the size of the page by about 3.5MB

-

- Imported all missing imports in the new `ButtonWithTooltipIcon` component
- Edit company route now uses the live server's url to get cities instead of localhost

-
- Fixed some minor issues with the People associated section of the companies details page. The correct list of reps now show up there.

-
- Update the reps page to use the new implementation on the server
- Fixed the slowness of the people assoiciated section of the user details and company details pages
