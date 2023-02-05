import { time } from "console";


const payGrades = {
    senior: {
        hourly: 30,
        annual: 60000
    },
    standard: {
        hourly: 30,
        annual: 60000
    },
    junior: 10
  };
  

  
  // Function to calculate final budget figure
  export function calculateBudget(timePeriod, payGrade, oneOffCost, ongoingCost) {
    // Look up hourly rate for pay grade
    let hourlyRate = payGrades[payGrade];

    // Fudge factor to hide exact hourly rate from users
    let fudgeFactor = Math.random()*.5 + .75;
  
    // Apply fudge factor to hourly rate
    hourlyRate *= fudgeFactor;
  
    // Calculate final budget figure
    let finalBudget = hourlyRate * timePeriod + oneOffCost + (ongoingCost*timePeriod);
  
    // Return final budget figure
    return finalBudget;
  }
