import { time } from "console";
import { subtaskForm } from "../types/subtask";

interface Budget
{
    time: number,
    period: string,
    payGrade: "junior" | "standard" | "senior",
    payGradeAmount: number,
    ongoingCosts: number,
    frequency: string,
    oneOffCost: number
}

const payGrades = {
    senior: {
        hourly: 30,
        annual: 60000
    },
    standard: {
        hourly: 20,
        annual: 40000
    },
    junior: {
        hourly: 10,
        annual: 20000
    }
  };
  

  
  // Function to calculate final budget figure
  export function calculateBudget(options:subtaskForm) {
    let personelCost = 0
    let maxWorkHours = 0

    for(let i = 0; i < options.time.length; i++){
        // Look up hourly rate for pay grade
        let hourlyRate = payGrades[options.payGrade[i]].hourly;

        // Fudge factor to hide exact hourly rate from users
        let fudgeFactor = Math.random()*.5 + .75;
    
        // Apply fudge factor to hourly rate
        hourlyRate *= fudgeFactor;

        // Calculate hours worked P.S Assume worker works 8 hour work days 5 times a week
        let workHours = options.time[i]

        if(options.period[i] === 'day') {
            workHours *= 8
        } else if (options.period[i] === 'month') {
            workHours *= 160
        }
        if (workHours > maxWorkHours) maxWorkHours = workHours;
        personelCost += workHours * hourlyRate * options.payGradeAmount[i]
    }

    

    let frequencyValue: number
    let ongoingCosts = options.ongoingCosts

    if(options.frequency === "week"){
        let projectWeeks = maxWorkHours/40
        ongoingCosts *= projectWeeks
    } else if (options.frequency === "month"){
        let projectMonths = maxWorkHours/160
        ongoingCosts *= projectMonths
    } else {
        let projectYears = maxWorkHours/2080
        ongoingCosts *= projectYears
    }
  
    // Calculate final budget figure
    let finalBudget = personelCost + options.oneOffCost + ongoingCosts;
  
    // Return final budget figure
    return Math.ceil(finalBudget);
  }
