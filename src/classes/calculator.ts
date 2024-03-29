import { time } from "console";
import { subtaskForm } from "../types/subtask";


// Pay grade data
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
  } as {[key: string]: {hourly: number, annual: number}};
  

  
  // Function to calculate final budget figure
export function calculateBudget(options: subtaskForm) {
    let personelCost = 0

    let hourlyRate = payGrades[options.paygrade].hourly;

    // Apply fudge factor to hourly rate
    if (options.fudgeCheckmark === true) {
        // Fudge factor to hide exact hourly rate from users
        let fudgeFactor = Math.random()*.4 + .8;
        hourlyRate *= fudgeFactor;
    }

    // Calculate hours worked P.S Assume worker works 8 hour work days 5 times a week
    let workHours = options.time

    if(options.period === 'day') {
        workHours *= 8
    } else if (options.period === 'month') {
        workHours *= 160
    }
    personelCost += workHours * hourlyRate * options.payGradeAmount
    

    // Calculate ongoing costs
    let ongoingCosts = options.ongoingCosts.ongoingCostsAmount
    let frequency = options.ongoingCosts.frequency


    if(frequency === "week"){
        let projectWeeks = workHours/40
        ongoingCosts *= projectWeeks
    } else if (frequency === "month"){
        let projectMonths = workHours/160
        ongoingCosts *= projectMonths
    } else {
        let projectYears = workHours/2080
        ongoingCosts *= projectYears
    }


    // Calculate final budget figure
    let subtaskBudget = personelCost + options.oneOffCosts + ongoingCosts;
  
    // Return final budget figure
    return Math.ceil(subtaskBudget);
  }
