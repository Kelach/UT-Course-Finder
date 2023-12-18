import { Title, Stack, Group, Badge, Collapse, Paper, Text, Select, Skeleton, ActionIcon, Divider, LoadingOverlay } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { CourseProps } from "./Popup";
import { BarChart } from "@mui/x-charts";
import { useEffect, useState } from "react";
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
// import DescriptionIcon from '@mui/icons-material/Description';
// import { testCourseChartData } from "./testCourseData"


function InfoToggle({ name, showDefault, content }: { name: string, content: string, showDefault?: boolean }) {
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
                    <Text ml={"lg"}>{content}</Text>
            </Collapse>
        </>
    )

}

interface GradeDataProps {
    letter: string[];
    count : number[];
}

interface ChartOptionsProps {
    year: string[];
    semester: Array<"Fall" | "Spring" | "Summer" | "Winter">;
}

function GradeDistribution({title, number, department}: {title: string, number: string, department: string}) {

    const [year, setYear] = useState<string>("2023");
    const [semester, setSemester] = useState<string>("Spring");
    const [gradeData, setGradeData] = useState<GradeDataProps | null>(null);
    const [chartOptions, setChartOptions] = useState<ChartOptionsProps | null>(null);
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

    }, [year, semester])
    const gradeCountFormatter = (gradeCount: number) => {
        if (gradeData === null) {
            return "N/A"
        }
        const totalCount = Object.values(gradeData).reduce((a, b) => a + b, 0);
        return `Count ${gradeCount} | ` + (100 * gradeCount / totalCount).toFixed(2).toString() + "%"
    }
    return gradeData == null  ? (
        <Text> No data found ... </Text>
    ) : (
        <>
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
            <Skeleton visible={null === gradeData}>
                {
                    gradeData.count.length === 0 ? (
                        <Text> No data found ... </Text>
                    ) : 
                (<BarChart
                    xAxis={[{ data: gradeData.letter, scaleType: "band", },]}
                    series={[{ data: gradeData.count, valueFormatter: gradeCountFormatter, }]}
                    width={450}
                    height={200}/>)
                }
            </Skeleton>
        </>
    );
}


export default function SearchResults(course: CourseProps) {
    const handleSyllabusRequest = () => {
        const syllabusRequested = confirm("Are you sure you want to view this syllabus in a new tab?");
        if (syllabusRequested){
            const syllabusURL = `https://utdirect.utexas.edu/apps/student/coursedocs/nlogon/?year=&semester=&department=${course.department}&course_number=${course.number}&course_title=${course.title}&unique=&instructor_first=&instructor_last=&course_type=In+Residence&search=Search`
            chrome.tabs.create({url : syllabusURL})
        }
        return false;
    }

    return (
        <Paper shadow="xl" w={475} radius={"xl"} my={"md"} mx={"sm"} p={"md"}>
            <Title ta={"center"} order={1}>{course.department} {course.number}</Title>
            <Text ta={"center"} c={"dimmed"} fs={"italic"}>{course.title}</Text>
            <Divider mx={"md"} mt={10} h={10} />
            <GradeDistribution title={course.title} department={course.department} number={course.number} />
            <Group justify="center" align="center" wrap="nowrap">
                <Badge component="button" onClick={handleSyllabusRequest} variant="light">
                    View Syllabus
                </Badge>
            </Group>
            <Stack gap={0}>
                <InfoToggle name={"Prerequisites"} content={course.prerequisites} showDefault={true} />
                <Divider mx={"md"} mt={10} h={20} />
                <InfoToggle name={"Description"} content={course.description} showDefault={false} />
            </Stack>
        </Paper>
    )
}

