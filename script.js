// Admin Login Code
let isAdmin = false;

let submit = function() {
    let entered = document.getElementsByName("psw")[0].value;
    if (entered === "rhhs@2025") {
        sessionStorage.setItem("isAdmin", "true");
        document.getElementById("verify").innerHTML = "Login successful!";
    } else {
        document.getElementById("verify").innerHTML = "Incorrect Password";
    }
};



 
// wevlyn
