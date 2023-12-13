import { useState } from 'react';
import withSuspense from '@src/shared/hoc/withSuspense';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';
import { Title, Text, Paper, Stack, Transition, Group, Collapse, Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import SearchBar from './SearchBar';

import logo from '@assets/img/logo.svg';
// import '@pages/popup/Popup.css';
import useStorage from '@src/shared/hooks/useStorage';
import exampleThemeStorage from '@src/shared/storages/exampleThemeStorage';
import { testCourseData } from "./testCourseData"
import SearchResults from './SearchResults';
export interface CourseProps {
  title: string;
  number: string;
  description: string;
  prerequisites: string;
  department: string;
}

function Popup() {
  const [course, setCourse] = useState<CourseProps | null>(null);
  return (
    <>
      <Title order={2} ta={"center"}>
        UT Course Finder
      </Title>
      <SearchBar courseData={testCourseData} setCourse={setCourse} />
      <Transition mounted={course != null}>
        {(styles) => course !== null ? (
          <SearchResults {...course} />
        ) : <></>}
      </Transition>
    </>
  );
};



export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
