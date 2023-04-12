const formElement = document.getElementById("calculator-form")

formElement.addEventListener("submit", function(e){
    e.preventDefault()
    let formData = new URLSearchParams(new FormData(formElement))

    fetch("/Calculator", {
        method:"post",
        body: formData
    }).then(res=>res.json()).then(res=>{
        let output = document.getElementById("output")
        console.log(output)
        output.innerHTML= new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(res.finalBudget)
    })
})

const saveButton = document.getElementById("saveQuote")

saveButton.addEventListener("click", function(e){
    e.preventDefault()
    let formData = new FormData(formElement)
    let body = {
        "name": formData.get("projectName"),
        "subtasks": [{
            "paygrade": formData.get("payGrade"),
            "time": formData.get("time"),
            "period": formData.get("period"),
            "amount": formData.get("payGradeAmount"),
            "ongoingCosts": {
                "amount": formData.get("ongoingAmount"),
                "frequency": formData.get("frequency"),
            },
            "oneOffCosts": formData.get("oneOffCosts")
        }]
    }
    fetch("/AddToQuotes", {
        method:"post",
        body: body,
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res=>res.json()).then(res=>{
        console.log(res)
    })
})


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
    console.log(subtask_header.innerHTML)
    for (var i = 0; i < subtask_count; i++) {
        subtask_header[i].innerHTML = "Subtask (" + (i+1) + ")"
    }
}

