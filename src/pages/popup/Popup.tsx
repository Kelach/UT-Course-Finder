import { useState } from 'react';
import withSuspense from '@src/shared/hoc/withSuspense';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';
import { Title, Stack, Transition, useMantineColorScheme, Button, Collapse, ScrollArea, Group, ActionIcon, useComputedColorScheme } from "@mantine/core";
import SearchBar from './SearchBar';
import SearchResults from './SearchResults';
import { useWindowScroll } from '@mantine/hooks';
import FeedbackOutlinedIcon from '@mui/icons-material/FeedbackOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
// import { DarkModeOutlined, FeedbackOutlined, LightModeOutlined } from '@mui/icons-material';

// import logo from '@assets/img/logo.svg';
// import '@pages/popup/Popup.css';
// import useStorage from '@src/shared/hooks/useStorage';
// import exampleThemeStorage from '@src/shared/storages/exampleThemeStorage';
/**
 * @todo:
 * - [X] fix course no course found error
 * - [ ] improve course grade distribution data
 * - [ ] improve course searching to search by course number or course title
 * - [ ] re-scrape ut professor information for each semester and add it as well as rmp rating for that professor
 * - [ ] add comments sections feature for each course...only verified ut students can comment (big-stretch)
*     - [ ] first define the schema for the comments, here's a starting point:
  *        comment: {
  *        - id: string,
  *        - upvotes: number,
  *        - downvotes: number,
  *        - content: string,
  *        - author: string,
  *        - date: string,
  *        - isReply: boolean
  *        - replies: comment[]
  *     }
 *    - [ ] add upvote and downvote feature for comments
 *    - [ ] add comment sorting by (upvotes, time, default should be a combo of most upvotes and time)
 * - [X] create better default view when no grade data is found
 * - [X] handle 404 errors when fetching database 
 * - [X] update styles with UT theme colors
 * - [X] add theme changing button (light vs. dark)
 * - implement course topics display (perhaps another collasbles)
 * - [X] make course search transition smoother (stretch) idea
 * - [X] consider creating own grades database (stretch)
 * - add loading animation when fetching data (stretch)
 * - clean up course titling e.g removing "TCCN: ..." + long course numbers e.g. 109s, 209s, 309s, ... (stretch)
 * 
 */

export interface CourseProps {
  title: string;
  number: string;
  description: string;
  prerequisites: string;
  department: string;
  professors: string[];
  topics: string[][];
  id: string;
}
export interface CourseOptionProps {
  title: string;
  department: string;
  number: string;
  id: string;
}

function Popup() {
  const [course, setCourse] = useState<CourseProps | null>(null);
  const { toggleColorScheme } = useMantineColorScheme();
  const computedTheme = useComputedColorScheme("light");
  const fallBackCourse = {
    title: "Course Not Found",
    number: "",
    description: "",
    prerequisites: "",
    department: "",
    professors: [],
    topics: [],
    id: ""
  }
  const handleFeedbackRequest = () => {
    const feedbackRequested = confirm("Are you sure you want to give feedback in a new tab?");
    if (feedbackRequested) {
      const feedbackURL = `https://forms.gle/CLs5edJC4dHSA9xN6`
      chrome.tabs.create({ url: feedbackURL })
    }
    return false;
  }
  return (
    <ScrollArea h={500}>
      <Group justify='space-between'>
        <ActionIcon variant='transparent' size={"xl"} onClick={() => {toggleColorScheme() }}>
          { computedTheme == "light" ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
        </ActionIcon>
        <ActionIcon variant='transparent' size={"xl"} onClick={handleFeedbackRequest}>
          {<FeedbackOutlinedIcon />}
        </ActionIcon>
      </Group>
      <Stack h={"100%"} align='center' justify='center'>
        <Title c={"orange"} mb={25} mt={95} order={1} ta={"center"}>
          UT Course Finder
        </Title>
        <SearchBar setCourse={setCourse} />
      </Stack>
      <Transition transition={"slide-up"} duration={500} timingFunction='ease' mounted={course !== null}>
          {(styles) => course !== null ? (
             <SearchResults {...course || fallBackCourse} />
          ) : <></> }
        </Transition>
    </ScrollArea>
  );
};



export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
