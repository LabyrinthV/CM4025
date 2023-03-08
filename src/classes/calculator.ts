import { time } from "console";

interface Budget
{
    time: number,
    period: string,
    payGrade: "junior" | "standard" | "senior",
    amount: number,
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
  export function calculateBudget(options:Budget) {
    // Look up hourly rate for pay grade
    let hourlyRate = payGrades[options.payGrade].hourly;

    // Fudge factor to hide exact hourly rate from users
    let fudgeFactor = Math.random()*.5 + .75;
  
    // Apply fudge factor to hourly rate
    hourlyRate *= fudgeFactor;

    // Calculate hours worked P.S Assume worker works 8 hour work days 5 times a week
    let workHours = options.time

    if(options.period === 'day') {
        workHours *= 8
    } else if (options.period === 'month') {
        workHours *= 160
    }

    let personelCost = workHours * hourlyRate

    let frequencyValue: number
    let ongoingCosts = options.ongoingCosts

    if(options.frequency === "week"){
        let projectWeeks = workHours/40
        ongoingCosts *= projectWeeks
    } else if (options.frequency === "month"){
        let projectMonths = workHours/160
        ongoingCosts *= projectMonths
    } else {
        let projectYears = workHours/2080
        ongoingCosts *= projectYears
    }
  
    // Calculate final budget figure
    let finalBudget = personelCost + options.oneOffCost + ongoingCosts;
  
    // Return final budget figure
    return Math.ceil(finalBudget);
  }
