import { getYReferenceLineClasses } from '@mui/x-charts/ChartsReferenceLine/ChartsYReferenceLine';
import reloadOnUpdate from 'virtual:reload-on-update-in-background-script';
// import { send } from 'vite';
import 'webextension-polyfill';
import { stringSimilarity } from "string-similarity-js";
import detailedCatalogJSON from "../../../data/detailedCatalog.json";
import { CourseOptionProps, CourseProps } from '../popup/Popup';
reloadOnUpdate('pages/background');

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
reloadOnUpdate('pages/content/style.scss');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("message: ", message)
    switch (message.action) {
        case "GradeDistribution":
            const { year, semester, title, number, department } = message
            fetch(`https://derec4.github.io/ut-grade-data/${year}%20${semester}.json`)
                .then((response) => response.json())
                .catch((error) => { 
                    console.error("error: ", error)
                    sendResponse({ data: { letter: [], count: [] } })
                 })
                .then((data) => {
                    const courseGradeData = getGradeDataByCourse(data, title, number, department)
                    console.log("function called")
                    sendResponse({ data: courseGradeData })
                }).catch((error) => {
                    console.error("error: ", error)
                    sendResponse({ data: { letter: [], count: [] } })
                })

            return true
        case "ChartOptions":
            sendResponse({ data: { year: ["2020", "2021", "2022", "2023"], semester: ["Fall", "Spring", "Summer"] } })
            break;
        case "CourseSuggestions":
            let detailedCatalog = detailedCatalogJSON as CourseProps[];
            let surfaceCourseCatalog : CourseOptionProps[] = detailedCatalog.map((course : CourseProps) => ({
                title: course["title"],
                number: course["number"],
                department: course["department"],
                id: course["id"]
            }))

            sendResponse({data : surfaceCourseCatalog});
            break;
        case "CourseInfo":
            let detailedCatalog_ = detailedCatalogJSON as CourseProps[];
            const {courseID} = message;
            sendResponse({data: detailedCatalog_[courseID]});
            break;
                

    }
}
);
interface GradeDataProps {
    "Academic Year Span": string,
    "Semester": string,
    "Section Number": number,
    "Course Prefix": string,
    "Course Number": number | string,
    "Course Title": string,
    "Course": string,
    "Letter Grade": string,
    "Count of letter grade": number,
    "Department/Program": string
}

// Helper functions
function isSameCourse(course: GradeDataProps, title: string, number: string, department: string) {
    /**
     * @description: Checks if two courses are the same. (uses similarity metric when comparing titles
     * due to the inconsistency in course titling between data sets)
     * @return {boolean}
     **/
    if (course["Course Number"].toString() === "311k" && course["Course Prefix"] === "COE")
        console.log(title, course["Course Title"], stringSimilarity(course["Course Title"].toLowerCase(), title.toLowerCase()), course["Course Number"].toString(), number.toString())
    return (stringSimilarity(course["Course Title"].toLowerCase(), title.toLowerCase()) >= 0.85
        && course["Course Number"].toString() === number.toString()
        && course["Course Prefix"].trim().toLowerCase() === department.trim().toLowerCase())
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
    const courseGradeData: [string, number][] = data.filter((course) => isSameCourse(course, title, number, department))
        .map((course) => ([course["Letter Grade"], course["Count of letter grade"]]))
    let letterGrades = Object.fromEntries(courseGradeData.map((course) => [course[0], 0]))

    // getting agregregate letter grade counts
    for (const [letterGrade, count] of courseGradeData) {
        letterGrades[letterGrade] += count
    }
    letterGrades = Object.fromEntries(Object.keys(letterGrades).sort().map((letterGrade) => [letterGrade, letterGrades[letterGrade]]))
    if ("Other" in letterGrades) delete letterGrades["Other"]

    return {
        letter: Object.keys(letterGrades),
        count: Object.values(letterGrades)
    }
}


console.log('background loaded');
