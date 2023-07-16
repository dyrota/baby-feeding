$(document).ready(function() {
    function login() {
        let username = $("#username").val();
        let password = $("#password").val();
    
        $.ajax({
            url: "/userData/login",
            type: "POST",
            data: JSON.stringify({ username: username, password: password }),
            contentType: "application/json",
            xhrFields: {
                withCredentials: true
            },
            success: function(response) {
                if (response.status === "success") {
                    storeUserToken(response.userId, username, password, response.role);
                    

                    // Redirect based on role
                    if (response.role === "ADMIN") {
                        alert("Authentication successful. You will be redirected to admin.html.");
                        window.location.href = 'admin.html';
                    } else if (response.role === "PHYSICIAN") {
                        alert("Authentication successful. You will be redirected to physician.html.");
                        window.location.href = 'physician.html';
                    } else {
                        alert("Error: Unknown role");
                    }
                } else {
                    alert("Error: " + response.message);
                }
            },
            error: function(error) {
                alert("Error: " + error.status + " " + error.statusText + "\n" + error.responseText);
            }
        });
    }
    
    function signup() {
        let username = $("#signup-username").val();
        let password = $("#signup-password").val();
        let role = $("#role").val();

        $.ajax({
            url: "/userData/save",
            type: "POST",
            data: JSON.stringify({ username: username, password: password, role: role }),
            contentType: "application/json",
            xhrFields: {
                withCredentials: true
            },
            success: function(response) {
                if (response.status === "success") {
                    // Redirect based on role
                    if (role === "ADMIN") {
                        alert("Signup successful. You will be redirected to admin.html.");
                        window.location.href = 'admin.html';
                    } else if (role === "PHYSICIAN") {
                        alert("Signup successful. You will be redirected to physician.html.");
                        window.location.href = 'physician.html';
                    } else {
                        alert("Error: Unknown role");
                    }
                } else {
                    alert("Error: " + response.message);
                }
            },
            error: function(error) {
                alert("Error: " + error.status + " " + error.statusText + "\n" + error.responseText);
            }
        });
    }

    function storeUserToken(userId, username, password, role) {
        // Store the user data in localStorage or sessionStorage
        let userData = {
            userId: userId,
            username: username,
            password: password,
            role: role
        };

        localStorage.setItem('userToken', JSON.stringify(userData));
    }

    $("#login-button").click(function() {
        login();
    });

    $("#signup-button").click(function() {
        signup();
    });

    $("#go-to-signup").click(function() {
        $("#login-section").hide();
        $("#signup-section").show();
    });

    $("#go-to-login").click(function() {
        $("#signup-section").hide();
        $("#login-section").show();
    });
});