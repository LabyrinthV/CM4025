// Description: This file contains the javascript for the calculator form

// This function is called when the user clicks the calculate quote button
const calculateQuoteButton = document.getElementById("calculateQuote")

calculateQuoteButton.addEventListener("click", function(e){
    calculateQuote()
})


// const originalForm = document.querySelector(".subtask-form")
// const originalSubQuote = form.querySelector(".subtaskQuote")

// if (originalSubQuote) {
//     originalSubQuote.addEventListener("click", async function(e){
//         console.log("clicked")
//         const cost = await calculateSubtask(form)
//         const output = content.querySelector(".subtaskOutput")
//         output.innerHTML= new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' })
//         .format(cost)
//     })
// }


// Calculate the quote, iterate through each subtask and add the cost to the total
async function calculateQuote() {
    
    const formElements = document.getElementsByClassName("subtask-form")
    const fudgeCheckmark = document.getElementById("fudgeCheckmark")
    let checked = true

    if (fudgeCheckmark) {
        checked = fudgeCheckmark.checked
    }

    let total = 0
    for (let formElement of formElements) {
        
        let cost = await calculateSubtask(formElement, checked)
        console.log(cost)
        total += cost
    }
    let output = document.getElementById("output")
        output.innerHTML= new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' })
        .format(total)
}

// Calculate the cost of a subtask

async function calculateSubtask(subtask, fudgeCheckmark) {
    let formData = new FormData(subtask)

    let body = {
        "paygrade": formData.get("paygrade"),
        "time": parseInt(formData.get("time")),
        "period": formData.get("period"),
        "payGradeAmount": parseInt(formData.get("payGradeAmount")),
        "ongoingCosts": {
            "ongoingCostsAmount": parseInt(formData.get("ongoingAmount")),
            "frequency": formData.get("frequency"),
        },
        "oneOffCosts": parseInt(formData.get("oneOffCosts")),
        "fudgeCheckmark": fudgeCheckmark
    }
    return fetch("/Calculator", {
        method:"post",
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res=>res.json()).then(res=>{
        return res.subtaskquote
    })
}

// Save the quote to the database
const saveButton = document.getElementById("saveQuote")
if (saveButton) {
    const fudgeCheckmark = document.getElementById("fudgeCheckmark")
    let checked = true

    if (fudgeCheckmark) {
        checked = fudgeCheckmark.checked
    }
    saveButton.addEventListener("click", function(e){
        e.preventDefault()
        let subtasks = document.querySelectorAll(".subtask-form")
        let subtaskArray = []
        for (var i = 0; i < subtasks.length; i++) {
            let formData = new FormData(subtasks[i])
            let subtask = {
                "paygrade": formData.get("paygrade"),
                "time": formData.get("time"),
                "period": formData.get("period"),
                "payGradeAmount": formData.get("payGradeAmount"),
                "ongoingCosts": {
                    "ongoingCostsAmount": formData.get("ongoingAmount"),
                    "frequency": formData.get("frequency"),
                },
                "oneOffCosts": formData.get("oneOffCosts"),
                
            }
            subtaskArray.push(subtask)
        }
        let body = {
            "quote": document.getElementById("output").value,
            "name": document.getElementById("projectName").value,
            "subtasks": subtaskArray,
            "fudgeCheckmark": checked,
        }
    
        fetch("/AddToQuotes", {
            method:"post",
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res=>res.text()).then(res=>{
            console.log(res)
        })
    })
}

// Update the quote in the database
const updateButton = document.getElementById("updateQuote")
if (updateButton) {
    const fudgeCheckmark = document.getElementById("fudgeCheckmark")
    let checked = true
    // Check for fudge checkmark
    if (fudgeCheckmark) {
        checked = fudgeCheckmark.checked
    }
    // Add event listener to update button
    updateButton.addEventListener("click", function(e){
        e.preventDefault()
        let subtasks = document.querySelectorAll(".subtask-form")
        console.log(subtasks)
        let subtaskArray = []
        for (var i = 0; i < subtasks.length; i++) {
            let formData = new FormData(subtasks[i])
            let subtask = {
                "paygrade": formData.get("paygrade"),
                "time": formData.get("time"),
                "period": formData.get("period"),
                "payGradeAmount": formData.get("payGradeAmount"),
                "ongoingCosts": {
                    "ongoingCostsAmount": formData.get("ongoingAmount"),
                    "frequency": formData.get("frequency"),
                },
                "oneOffCosts": formData.get("oneOffCosts"),
                
            }
            subtaskArray.push(subtask)
        }
        let body = {
            "quote": document.getElementById("output").value,
            "name": document.getElementById("projectName").value,
            "subtasks": subtaskArray,
            "fudgeCheckmark": checked,
            "id": document.getElementById("quoteId").value,
        }
    
        fetch("/UpdateQuote", {
            method:"post",
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res=>res.text()).then(res=>{
            console.log(res)
        })
    })
}

// Add a new subtask row
function addSubtaskRow() {
    const template = document.getElementById("subtask-template")
    const content = template.content.cloneNode(true)

    const workerList = document.getElementById("subtasks")
    workerList.appendChild(content)

    const form = workerList.lastElementChild
    const calculateSubtaskButton = form.querySelector(".subtaskQuote")
    console.log(content.firstElementChild)
    calculateSubtaskButton.addEventListener("click", async function(e){
        console.log("clicked")
        const cost = await calculateSubtask(form)
        const output = content.querySelector(".subtaskOutput")
        output.innerHTML= new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' })
        .format(cost)
    })
    updateSubtaskHeader()
    
}

function removeSubtaskRow(row) {
    row.parentNode.remove()
}


function updateSubtaskHeader() {
    // Get number of items in subtasks class
    let subtask_count = document.querySelectorAll(".subtask").length
    let subtask_header = document.querySelectorAll(".subtask-header")
    for (var i = 0; i < subtask_count; i++) {
        subtask_header[i].innerHTML = "Subtask " + (i+1) 
    }
}
