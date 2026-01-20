// Admin Login Code
let isAdmin = false;

let submit = function() {
    let entered = document.getElementsByName("psw")[0].value;
    if (entered === "rhhs@2025") {
        sessionStorage.setItem("isAdmin", "true");
        document.getElementById("verify").innerHTML = "Login successful!";
        showAdmin();
    } else {
        document.getElementById("verify").innerHTML = "Incorrect Password";
    }
};

showAdmin = function () {
     document.getElementById("header").innerHTML = "RHHS Lost and Found Website - Admin View"

}

 
// wevlyn
