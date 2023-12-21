import { useState } from 'react';
import { Combobox, InputBase, useCombobox, Group, Text, CloseButton, ScrollAreaAutosize } from '@mantine/core';
import { CourseOptionProps, CourseProps } from './Popup';
import { useEffect } from 'react';

function CourseOption(course: CourseOptionProps) {
  return (
    <Group  wrap={"nowrap"} preventGrowOverflow={true}>
      <Text miw={30} fz={18} fw={600}>{course.department}</Text>
      <div>
        <Text fz={"sm"}>{course.number}</Text>
        <Text maw={200} truncate={"end"} fz={15}>{course.title}</Text>
      </div>
    </Group>
  )
}

export default function SearchBar({setCourse}: {setCourse: React.Dispatch<React.SetStateAction<CourseProps | null>>} ) {

  const [courseSuggestions, setCourseSuggestions] = useState<CourseOptionProps[]>([]);
  const [search, setSearch] = useState('');
  const maxSuggestions = 10;
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  useEffect(() => {
    chrome.runtime.sendMessage({action: "CourseSuggestions"}, (response) => {
      setCourseSuggestions(response.data);
    })
  }, [])

  // filtering 
  const getFilteredOptions = () => {
    let filteredOptions = []
    for (const course of courseSuggestions) {
      if (`${course.department} ${course.number}`.toLowerCase().includes(search.toLowerCase().trim()) 
      || course.title.toLowerCase().trim().includes(search.toLowerCase().trim())){
        filteredOptions.push(course);
      }
      if (filteredOptions.length >= maxSuggestions) break;
    }
    return filteredOptions;
  } 
// setting search options
  const options = getFilteredOptions().map((courseOption: CourseOptionProps, index) => (
    <Combobox.Option value={`${JSON.stringify(courseOption)}`} key={`${courseOption.id}`}>
      <CourseOption {...courseOption} />
    </Combobox.Option>
  ));
  
  // selects first option
  useEffect(() => {
    combobox.selectFirstOption();
  }, [search])
  
  // on submit handler
  const onOptionSubmitHandler = (courseOptionJSONString : string) => {
    let courseOption = JSON.parse(courseOptionJSONString) as CourseOptionProps
    setSearch( `${courseOption.department} ${courseOption.number}`);
    // setting new course
    chrome.runtime.sendMessage({action: "CourseInfo", courseID: courseOption.id}, (response) => {
      if (response.data){
        setCourse(response.data);
      } else{ console.log("error: tried to handle course option that was not found", response.data)}
      // closes dropdown
      combobox.closeDropdown();
    })
  }

  return (
    <Combobox
      store={combobox}
      withinPortal={false}
      onOptionSubmit={onOptionSubmitHandler}
      position='bottom'
      >
      <Combobox.Target>
        <InputBase
        size='md'
        w={"75vw"}
      radius={"xl"}
          // rightSection={<Combobox.Search />}
          value={search}
          onChange={(event) => {
            combobox.openDropdown();
            combobox.updateSelectedOptionIndex();
            setSearch(event.currentTarget.value);
          }}
          onClick={() => combobox.openDropdown()}
          onFocus={() => combobox.openDropdown()}
          onBlur={() => {
            combobox.closeDropdown();
            setSearch(search || "");
          }}
          placeholder="E.g. CS 349"
          // rightSectionPointerEvents="none"
          rightSection={
            search !== '' && (
              <CloseButton
                size="sm"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {setSearch(''); setCourse(null)}} // clears search
                aria-label="Clear value"
              />
            )
          }
        />
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options >
          <ScrollAreaAutosize scrollbarSize={"0.4rem"} mah={200} type='scroll' >
          {options.length > 0 ? options : <Combobox.Empty>No Course Found :/</Combobox.Empty>}
          </ScrollAreaAutosize>
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}