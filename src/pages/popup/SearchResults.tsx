import { Title, Stack, Group, Button, Collapse, Paper, Text, Select } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { CourseProps } from "./Popup";
import { BarChart } from "@mui/x-charts";
import { useEffect, useState } from "react";
import { testCourseChartData } from "./testCourseData"


function InfoToggle({ name, showDefault, content }: { name: string, content: string, showDefault?: boolean }) {
    const [show, { toggle }] = useDisclosure(showDefault || false);
    return (
        <>
            <Group>
                <Text>{name}</Text>
                <Button onClick={toggle}>{show ? "C" : "O"}</Button>
            </Group>
            <Collapse in={show}>
                <Paper>
                    <Text>{content}</Text>
                </Paper>
            </Collapse>
        </>
    )

}

interface GradeDataProps {
    [key: string]: number;
}
interface ChartOptionsProps {
    year: string[];
    semester: Array<"Fall" | "Spring" | "Summer" | "Winter">;
}
function GradeDistribution() {

    const [year, setYear] = useState<string>("2023");
    const [semester, setSemester] = useState<string>("Fall");
    const [data, setData] = useState<GradeDataProps | null>(null);
    const [chartOptions, setChartOptions] = useState<ChartOptionsProps | null>(null);
    useEffect(() => {
        // retreiving database information
        chrome.runtime.sendMessage({ message: "GradeDistribution", year: year, semester: semester },
            (response) => {
                console.log("recieved grade disribution data", response);
                setData(response.data);
            })
            console.log("setting data")
            setData(testCourseChartData)
            setChartOptions({year: ["2020","2021","2022","2023"], semester: ["Fall", "Spring", "Summer"]})
            // retreiving chart options
        chrome.runtime.sendMessage({ message: "ChartOptions" }, (response) => {
            console.log("recieved chart options", response)
            // setChartOptions(response.data)
        })

    }, [year, semester])
    const gradeCountFormatter = (gradeCount: number) => {
        if (data === null) {
            return "N/A"
        }
        const totalCount = Object.values(data).reduce((a, b) => a + b, 0) ;
        return  `Count ${gradeCount} | ` + (100*gradeCount/totalCount).toFixed(2).toString() + "%"
    }
    return data ? (
        <>
        <Title>Grade Distribution</Title>
        <Select 
        label="Select Year"
        value={year}
        onChange={(value) => setYear(value || "2023")}
        data={chartOptions?.year}
        />

            <BarChart
                xAxis={[{data: Object.keys(data),scaleType: "band"},]}
                series={[{data: Object.values(data),valueFormatter: gradeCountFormatter,}]}
                width={500}
                height={200}
            />
        </>
    ):(
        <Text> No data found ... </Text>
    );
}


export default function SearchResults(course: CourseProps) {
    return (
        <>
            <Title>{course.title}</Title>
            <Text c={"dimmed"}>{course.number}</Text>
            <Text ta={"center"} c="dimmed" fz={"sm"}>View Syllabus</Text>
            <Stack>
                <InfoToggle name={"Prerequisites:"} content={course.prerequisites} showDefault={true} />
                <InfoToggle name={"Description:"} content={course.description} showDefault={false} />
            </Stack>
            <GradeDistribution />
        </>
    )
}

