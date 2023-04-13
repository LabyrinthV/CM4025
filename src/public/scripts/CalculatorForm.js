const calculateQuoteButton = document.getElementById("calculateQuote")

calculateQuoteButton.addEventListener("click", function(e){
    calculateQuote()
})


async function calculateQuote() {
    
    const formElements = document.getElementsByClassName("subtask-form")
    let total = 0
    for (let formElement of formElements) {
        
        let cost = await calculateSubtask(formElement)
        console.log(cost)
        total += cost
    }
    let output = document.getElementById("output")
        output.innerHTML= new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' })
        .format(total)
}

async function calculateSubtask(subtask) {
    let formData = new FormData(subtask)

    let body = {
        "paygrade": formData.get("payGrade"),
        "time": formData.get("time"),
        "period": formData.get("period"),
        "payGradeAmount": formData.get("payGradeAmount"),
        "ongoingCosts": {
            "ongoingCostsAmount": formData.get("ongoingAmount"),
            "frequency": formData.get("frequency"),
        },
        "oneOffCosts": formData.get("oneOffCosts")
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


const saveButton = document.getElementById("saveQuote")
if (saveButton) {
    saveButton.addEventListener("click", function(e){
        e.preventDefault()
        let subtasks = document.querySelectorAll(".subtask-form")
        let subtaskArray = []
        for (var i = 0; i < subtasks.length; i++) {
            let formData = new FormData(subtasks[i])
            let subtask = {
                "paygrade": formData.get("payGrade"),
                "time": formData.get("time"),
                "period": formData.get("period"),
                "payGradeAmount": formData.get("payGradeAmount"),
                "ongoingCosts": {
                    "ongoingCostsAmount": formData.get("ongoingAmount"),
                    "frequency": formData.get("frequency"),
                },
                "oneOffCosts": formData.get("oneOffCosts")
            }
            subtaskArray.push(subtask)
        }
        let body = {
            "name": document.getElementById("projectName").value,
            "subtasks": subtaskArray
        }
    
        fetch("/AddToQuotes", {
            method:"post",
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res=>res.json()).then(res=>{
            console.log(res)
        })
    })
}




function addSubtaskRow() {
    const template = document.getElementById("subtask-template")
    const content = template.content.cloneNode(true)

    const workerList = document.getElementById("subtasks")
    workerList.appendChild(content)
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
