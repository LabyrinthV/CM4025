function deleteQuote(id) {
    fetch("/DeleteQuote/" + id).then(res=>{
        if (res.status == 200) {
            location.reload()
        }
        else {
            console.log("Failed to delete quote")
        }
    }
    )
}