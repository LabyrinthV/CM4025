const formElement = document.getElementById("calculator-form")

formElement.addEventListener("submit", function(e){
    e.preventDefault()
    let formData = new URLSearchParams(new FormData(formElement))

    fetch("/Calculator", {
        method:"post",
        body: formData
    }).then(res=>res.json()).then(res=>{
        let output = document.getElementById("output")
        output.innerHTML= new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(res.finalBudget)
    })
})

