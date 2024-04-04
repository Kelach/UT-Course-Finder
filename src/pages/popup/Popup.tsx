import { useState } from 'react';
import withSuspense from '@src/shared/hoc/withSuspense';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';
import { Title, Stack, Transition, useMantineColorScheme, Button, Collapse, ScrollArea, Group, ActionIcon, useComputedColorScheme } from "@mantine/core";
import SearchBar from './SearchBar';
import SearchResults from './SearchResults';
import FeedbackOutlinedIcon from '@mui/icons-material/FeedbackOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import {doc, onSnapshot } from 'firebase/firestore';
import { Text } from '@mantine/core';
import { firestore } from '../background/firebase';
import { useEffect } from 'react';
// import { DarkModeOutlined, FeedbackOutlined, LightModeOutlined } from '@mui/icons-material';
// import logo from '@assets/img/logo.svg';
// import '@pages/popup/Popup.css';
// import useStorage from '@src/shared/hooks/useStorage';
// import exampleThemeStorage from '@src/shared/storages/exampleThemeStorage';
// vision: UT course indexer that is integrated with the course schedule during registration times
// and allows students to register for courses, and keep track of their course schedules
/**
 * @todo:
 * - [ ] add text hover labels for feedback, theme, and course flagging icons
 * - [ ] hover expand descriptions, leave prerequisites open by default
 * - [ ] improve course searching to search by course number or course title (will need to build a scraper that scrapes course schedule)
 * - [X] add simple firestore listening to track course searches
 * - [ ] add share button for main screen
 * - [ ] include list of profs who've taught course instead of current rmp
 * - [ ] add button to flag course for being incorrect 
 * - [ ] connect with google analytics, add most popular course search message
 * - [ ] add button to rate chrome extension (later)
 * - [ ] show professor for each grade semester + add rmp rating (build synamic web scraper) -> https://www.npmjs.com/package/node-html-parser
 * - [ ] add course schedule integration (stretch)
 * - [Z] add comments sections feature for each course...only verified ut students can comment (big-stretch)
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
 *    - [Z] add upvote and downvote feature for comments
 *    - [Z] add comment sorting by (upvotes, time, default should be a combo of most upvotes and time)
 * - [X] add hover effect to view syllabus badge
 * - [X] fix course no course found error
 * - [X] re-scrape ut professor information for each semester and add it as well as rmp rating for that professor
 * - [X] create better default view when no grade data is found
 * - [X] improve course grade distribution data (good enough for now)
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
  professors: {year: string, semester: string, firstName: string, lastName: string}[];
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
  const [searchCount, setSearchCount] = useState<number>(0);
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
  useEffect(() => {
    console.log("snapshot placed")
    onSnapshot(doc(firestore, "count", (new Date()).toLocaleDateString('en-US').replaceAll("/", "-")), (doc) : void => {
      if (doc.exists()) setSearchCount(doc?.data().count || 0);
    });
  }, []);

  
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
        <Title c={"orange"} mb={15} mt={80} order={1} ta={"center"}>
          UT Course Finder
        </Title>
        <Text td={"italic"}>{searchCount} searches today...</Text>
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
