import { useState } from 'react';
import withSuspense from '@src/shared/hoc/withSuspense';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';
import { Title, Stack, Transition, Group, Collapse, Button, ScrollArea } from "@mantine/core";
import SearchBar from './SearchBar';
import SearchResults from './SearchResults';
import courseDataJSON from '../../../data/detailedCatalog.json';

// import logo from '@assets/img/logo.svg';
// import '@pages/popup/Popup.css';
// import useStorage from '@src/shared/hooks/useStorage';
// import exampleThemeStorage from '@src/shared/storages/exampleThemeStorage';
import { testCourseData } from "./testCourseData"

export interface CourseProps {
  title: string;
  number: string;
  description: string;
  prerequisites: string;
  department: string;
  professors?: string[];
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
  return (
    <ScrollArea h={500}>
      <Stack h={"100%"} align='center' justify='center'>
        <Title mt={180} order={1} ta={"center"}>
          UT Course Finder
        </Title>
        <SearchBar setCourse={setCourse} />
      </Stack>
        <Transition transition={"slide-up"} duration={500} timingFunction='ease' mounted={course !== null}>
          {(styles) => course !== null ? (
            <SearchResults {...course} />
          ) : <></>}
        </Transition>
    </ScrollArea>
  );
};



export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
