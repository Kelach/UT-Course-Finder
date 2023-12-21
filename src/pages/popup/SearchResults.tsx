import { Title, Stack, Group, Badge, Collapse, Paper, Text, Select, Skeleton, ActionIcon, Divider, useComputedColorScheme, ScrollArea } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { CourseProps } from "./Popup";
import { BarChart } from "@mui/x-charts";
import { useEffect, useState } from "react";
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import {ThemeProvider, createTheme} from "@mui/material/styles"
// import DescriptionIcon from '@mui/icons-material/Description';
// import { testCourseChartData } from "./testCourseData"


//**** Interfaces ****
interface GradeDataProps {
    letter: string[];
    count: number[];
}

interface ChartOptionsProps {
    year: string[];
    semester: Array<"Fall" | "Spring" | "Summer" | "Winter">;
}

//**** Helper Components ****
function InfoToggle({ name, showDefault, content, hasScroll }: { name: string, content: string, showDefault?: boolean, hasScroll?: boolean }) {
    const [show, { toggle }] = useDisclosure(showDefault || false);
    return (
        <>
            <Group align="center" gap={0}>
                <ActionIcon size={"lg"} c={"dark"} variant="transparent" onClick={toggle}>
                    {show ? <ExpandMoreRoundedIcon /> : <KeyboardArrowRightRoundedIcon />}
                </ActionIcon>
                <Text fw={600} fz={15} c={show ? "dimmed" : ""}>{name}</Text>
            </Group>
            <Collapse in={show}>
                <ScrollArea scrollbars="y" scrollbarSize={"0.25rem"} h={hasScroll ? 200 : undefined}>
                    <Text ml={"lg"}>{content}</Text>
                </ScrollArea>
            </Collapse>
        </>
    )

}

function NoGradeData() {

    return (
        <Stack c={"red.1"} justify="center" align="center" h={200}>
            <Title order={1} fw={700} c={"dark"}>Awh Snap :/</Title>
            <Title fw={600} c={"dimmed"} order={5}>No Data Found...</Title>
        </Stack>
    )
}

function GradeDistribution({ title, number, department }: { title: string, number: string, department: string }) {
    //**CONSTANTS */
    const [year, setYear] = useState<string>("2023");
    const [semester, setSemester] = useState<string>("Spring");
    const [gradeData, setGradeData] = useState<GradeDataProps | null>(null);
    const [chartOptions, setChartOptions] = useState<ChartOptionsProps | null>(null);
    const computedColorScheme = useComputedColorScheme("light");
    const barChartTheme = createTheme({ palette: { mode: computedColorScheme } })

    /**HOOKS */
    useEffect(() => {
        // retreiving course grade distribution
        chrome.runtime.sendMessage(
            {
                action: "GradeDistribution",
                year: year,
                semester: semester,
                title: title,
                number: number,
                department: department
            },
            (response) => {
                console.log("recieved grade disribution data", response);
                setGradeData(response.data);
            })
        console.log("setting data")
        // retreiving chart options
        chrome.runtime.sendMessage({ action: "ChartOptions" }, (response) => {
            console.log("recieved chart options", response)
            setChartOptions(response.data)
        })

    }, [year, semester, title])
    const gradeCountFormatter = (gradeCount: number) => {
        if (gradeData !== null) {
            const totalCount = Object.values(gradeData)[1].reduce((a : number, b : number) => a + b, 0);
            return `Count: ${gradeCount} | ${(100 * gradeCount / totalCount).toFixed(2).toString()}%`
        }
        return ""
    }

    return (
        <Skeleton visible={gradeData === null}>
            <Paper px="md">
                <Title my={"lg"} order={4} ta={"center"}>Grade Distribution</Title>
                <Group justify="center" wrap="nowrap">
                    <Select
                        size="sm"
                        label="Select Year"
                        value={year}
                        onChange={(value) => setYear(value || "2023")}
                        radius={"md"}
                        comboboxProps={{
                            transitionProps: { transition: 'pop', duration: 200 },
                            dropdownPadding: 10,
                            shadow: 'md'
                        }}
                        data={chartOptions?.year} />
                    <Select
                        size="sm"
                        label="Select Semester"
                        value={semester}
                        onChange={(value) => setSemester(value || "Spring")}
                        radius={"md"}
                        comboboxProps={{
                            transitionProps: { transition: 'pop', duration: 200 },
                            dropdownPadding: 10,
                            shadow: 'md'
                        }}
                        data={chartOptions?.semester} />
                </Group>
                {
                    gradeData?.count.length === 0 ? (
                        <NoGradeData />
                    )
                        :
                        <ThemeProvider theme={barChartTheme}>
                            <BarChart
                                colors={(theme) => { console.log(theme); return ["#fff"] }}
                                // colors going from green to red
                                xAxis={[{ data: gradeData?.letter || ["A"], scaleType: "band", },]}
                                series={[{ color: "#fdb462", data: gradeData?.count || [9999], valueFormatter: gradeCountFormatter, }]}
                                width={450}
                                height={200} />
                        </ThemeProvider>
                }
            </Paper>
        </Skeleton>
    );
}

//**** Main Component ****
export default function SearchResults(course: CourseProps) {
    const handleSyllabusRequest = () => {
        const syllabusRequested = confirm("Are you sure you want to view this syllabus in a new tab?");
        if (syllabusRequested) {
            const syllabusURL = `https://utdirect.utexas.edu/apps/student/coursedocs/nlogon/?year=&semester=&department=${course.department}&course_number=${course.number}&course_title=${course.title}&unique=&instructor_first=&instructor_last=&course_type=In+Residence&search=Search`
            chrome.tabs.create({ url: syllabusURL })
        }
        return false;
    }

    return (
        <Paper mt={10} shadow="xl" w={475} radius={"xl"} my={"md"} mx={"sm"} p={"md"}>
            <Title ta={"center"} order={1}>{course.department} {course.number}</Title>
            <Text ta={"center"} c={"dimmed"} fs={"italic"}>{course.title}</Text>
            <Group mt={"xs"} justify="center" align="center" wrap="nowrap">
                <Badge component="button" onClick={handleSyllabusRequest} variant="light">
                    View Syllabus
                </Badge>
            </Group>
            <Divider mx={"md"} mt={10} h={10} />
            <GradeDistribution title={course.title} department={course.department} number={course.number} />
            <Stack gap={0} mt={"lg"}>
                <InfoToggle name={"Prerequisites"} content={course.prerequisites} showDefault={true} />
                <Divider mx={"md"} mt={10} h={20} />
                <InfoToggle name={"Description"} hasScroll={true} content={course.description} showDefault={false} />
                {
                    course.topics.map((topic, index) => (
                        <>
                        <Title order={4}>
                            Topics {index + 1}: {topic[0]}
                        </Title>
                        <Text>
                            {topic[1]}
                        </Text>
                        </>
                    ))

                }
            </Stack>
        </Paper>
    )
}

