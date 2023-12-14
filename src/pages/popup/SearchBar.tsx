import { useState } from 'react';
import { Combobox, InputBase, Input, useCombobox, Group, Text } from '@mantine/core';
import { CourseProps } from './Popup';
import { useEffect } from 'react';

function CourseOption(course: CourseProps) {
  return (
    <Group wrap={"nowrap"} preventGrowOverflow={true}>
      <Text fz={18} fw={600}>{course.department}</Text>
      <div>
        <Text fz={"sm"}>{course.number}</Text>
        <Text truncate={"end"} fz={15}>{course.title}</Text>
      </div>
    </Group>
  )
}

export default function SearchBar({courseData, setCourse} : {courseData : CourseProps[], setCourse: React.Dispatch<React.SetStateAction<CourseProps | null>>}) {

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [value, setValue] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // filtering 
  const shouldFilterOptions = courseData.every((item) => item.title !== search || item.description !== search);
  const filteredOptions = shouldFilterOptions
    ? courseData.filter((course : CourseProps) => course.title.toLowerCase().includes(search.toLowerCase().trim())
    || `${course.department} ${course.number}`.toLowerCase().includes(search.toLowerCase().trim()))
    : courseData;
// setting search options
  const options = filteredOptions.map((course: CourseProps) => (
    <Combobox.Option value={`${course.department} ${course.number}: ${course.title}`} key={`${course.title}:${course.number}`}>
      <CourseOption {...course} />
    </Combobox.Option>
  ));

  // selects first option
  useEffect(() => {
    combobox.selectFirstOption();
  }, [search])
  
  // on submit handler
  const onOptionSubmitHandler = (courseOption : string) => {
    setSearch(courseOption);
    // setting new course
    const course = courseData.find((item : CourseProps) => courseOption === `${item.department} ${item.number}: ${item.title}`);
    if (course) {
      setCourse(course);
    }else{ console.log("error: tried to handle course option that was not found", course)}
    combobox.closeDropdown(); // closes dropdown
  }
  return (
    <Combobox
      store={combobox}
      withinPortal={false}
      onOptionSubmit={onOptionSubmitHandler}
      >
      <Combobox.Target>
        <InputBase
        size='md'
        w={"50vw"}
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
            setSearch(value || "");
          }}
          placeholder="E.g. CS 349"
          rightSectionPointerEvents="none"
        />
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options >
          {options.length > 0 ? options : <Combobox.Empty>No Course Found :/</Combobox.Empty>}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}