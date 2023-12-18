import { useState } from 'react';
import { Combobox, InputBase, useCombobox, Group, Text, CloseButton } from '@mantine/core';
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

export default function SearchBar({setCourse}: {setCourse: React.Dispatch<React.SetStateAction<CourseProps | null>>}) {

  const [courseSuggestions, setCourseSuggestions] = useState<CourseOptionProps[]>([]);
  const [search, setSearch] = useState('');
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  useEffect(() => {
    chrome.runtime.sendMessage({message: "CourseSuggestions"}, (response) => {
      setCourseSuggestions(response.data);
    })
  }, [])

  // filtering 
  const shouldFilterOptions = courseSuggestions.every((item) => item.title !== search || item.number !== search);
  const filteredOptions = shouldFilterOptions
    ? courseSuggestions.filter((course : CourseOptionProps) => course.title.toLowerCase().includes(search.toLowerCase().trim())
    || `${course.department} ${course.number}`.toLowerCase().includes(search.toLowerCase().trim()))
    : courseSuggestions;

// setting search options
  const options = filteredOptions.map((courseOption: CourseOptionProps, index) => (
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
    chrome.runtime.sendMessage({message: "CourseInfo", courseID: courseOption.id}, (response) => {
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
        <Combobox.Options mah={350} style={{overflowY: 'auto'}} >
          {options.length > 0 ? options : <Combobox.Empty>No Course Found :/</Combobox.Empty>}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}