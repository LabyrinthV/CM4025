import { time } from "console";

interface Budget
{
    time: number,
    period: string,
    payGrade: string,
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
    let hourlyRate = payGrades[options.payGrade];

    // Fudge factor to hide exact hourly rate from users
    let fudgeFactor = Math.random()*.5 + .75;
  
    // Apply fudge factor to hourly rate
    hourlyRate *= fudgeFactor;

    let frequencyValue: number

    if(options.frequency === "week"){
        
    } else if (options.frequency === "month"){

    } else {

    }
  
    // Calculate final budget figure
    let finalBudget = hourlyRate * options.time + options.oneOffCost + options.ongoingCosts;
  
    // Return final budget figure
    return finalBudget;
  }
