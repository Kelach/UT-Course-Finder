import { getYReferenceLineClasses } from '@mui/x-charts/ChartsReferenceLine/ChartsYReferenceLine';
import reloadOnUpdate from 'virtual:reload-on-update-in-background-script';
// import { send } from 'vite';
import 'webextension-polyfill';
import { stringSimilarity } from "string-similarity-js";
// import detailedCatalogJSON from "../../../data/detailedCatalog.json";
import { CourseOptionProps, CourseProps } from '../popup/Popup';
reloadOnUpdate('pages/background');
/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
reloadOnUpdate('pages/content/style.scss');
const BASE_DATA_URL = "https://raw.githubusercontent.com/Kelach/UT-Course-Finder/main/data"
let detailedCatalog : CourseProps[] = [];
interface GradeDataProps {
    "Semester": string,
    "Number": string,
    "Title": string,
    "Grades": {string : number},
    "Department": string
}
https://raw.githubusercontent.com/Kelach/UT-Course-Finder/main/data/grades/Fall%202020.json
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case "GradeDistribution":
            const { year, semester, title, number, department } = message
            // console.log(`https://derec4.github.io/ut-grade-data/${year}%20${semester}.json`)
            fetch(`${BASE_DATA_URL}/grades/${semester}%20${year}.json`)
                .then((response) => response.json())
                .catch((error) => {
                    console.log(error)
                    sendResponse({ data: { letter: [], count: [] } })
                 })
                .then((data) => {
                    const courseGradeData = getGradeDataByCourse(data, title, number, department)
                    // console.log(data)
                    sendResponse({ data: courseGradeData })
                }).catch((error) => {
                    console.log(error)
                    sendResponse({ data: { letter: [], count: [] } })
                })

            return true
        case "ChartOptions":
            sendResponse({ data: { year: ["2020", "2021", "2022", "2023"], semester: ["Fall", "Spring", "Summer"] } })
            break;
        case "CourseSuggestions":
            let surfaceCourseCatalog : CourseOptionProps[] = detailedCatalog.map((course : CourseProps) => ({
                title: course["title"],
                number: course["number"],
                department: course["department"],
                id: course["id"]
            }))

            sendResponse({data : surfaceCourseCatalog});
            break;
        case "CourseInfo":
            const {courseID} = message;
            sendResponse({data: detailedCatalog[courseID]});
            break;
                

    }
}
);


// Helper functions
function isSameCourse(course: GradeDataProps, title: string, number: string, department: string) {
    /**
     * @description: Checks if two courses are the same. (uses similarity metric when comparing titles
     * due to the inconsistency in course titling between data sets)
     * @return {boolean}
     **/
    return (stringSimilarity(course["Title"].toLowerCase(), title.toLowerCase()) >= 0.6
        && stringSimilarity(course["Number"].trim().toLowerCase(), number.trim().toLowerCase()) >= 0.90
        && stringSimilarity(course["Department"].trim().toLowerCase(), department.trim().toLowerCase()) >= 0.95)
}

function getGradeDataByCourse(data: GradeDataProps[], title: string, number: string, department: string) {
    /**
     * @description: Calculates letter grade data for a specific course
     * @param {GradeDataProps[]} data: grade data for all courses
     * @param {string} title: course title
     * @param {string} number: course number
     * @param {string} department: course department
     * @return {letter: string[], count: number[]}
     */
    const courseGradeData: GradeDataProps | undefined = data.find((course) => isSameCourse(course, title, number, department))
    if (!courseGradeData) return { letter: [], count: [] }
    // console.log(data.filter(course => isSameCourse(course, title, number, department)))
    // console.log(stringSimilarity("301H".toLowerCase(), "301".toLowerCase()) )

    if ("Other" in courseGradeData["Grades"]) delete courseGradeData["Grades"]["Other"]

    return {
        letter: Object.keys(courseGradeData["Grades"]),
        count: Object.values(courseGradeData["Grades"])
    }
}

async function loadCatalog(){
    fetch(`${BASE_DATA_URL}/courses/detailedCatalog.json`)
    .then((response) => response.json())
    .catch((error) => {console.log(error); return []})
    .then((data : CourseProps[]) => {
        detailedCatalog = data;
    })
}

loadCatalog();
// console.log('background loaded');
