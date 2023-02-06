const formElement = document.getElementById("calculator-form")

formElement.addEventListener("submit", function(e){
    e.preventDefault()
    let formData = new URLSearchParams(new FormData(formElement))

    fetch("/Calculator", {
        method:"post",
        body: formData
    }).then(res=>res.json()).then(res=>console.log(res))
})

