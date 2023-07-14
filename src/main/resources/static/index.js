$(document).ready(function() {
    function login() {
        let username = $("#username").val();
        let password = $("#password").val();
    
        $.ajax({
            url: "http://localhost:8080/userData/login",
            type: "POST",
            data: JSON.stringify({ username: username, password: password }),
            contentType: "application/json",
            xhrFields: {
                withCredentials: true
            },
            success: function(response) {
                if (response.status === "success") {
                    storeUserToken(response.userId, username, password, response.role);
                    alert("Authentication successful. You will be redirected to user.html.");
                    window.location.href = 'user.html';
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
            url: "http://localhost:8080/userData/save",
            type: "POST",
            data: JSON.stringify({ username: username, password: password, role: role }),
            contentType: "application/json",
            xhrFields: {
                withCredentials: true
            },
            success: function(response) {
                if (response.status === "success") {
                    alert("Signup successful. You will be redirected to user.html.");
                    window.location.href = 'user.html';
                } else {
                    alert("Error: " + response.message);
                }
            },
            error: function(error) {
                alert("Error: " + error.status + " " + error.statusText + "\n" + error.responseText);
            }
        });
    }

    function handleAuthResponse(response) {
        if (response.status === "success") {
            // Store the user data in localStorage
            localStorage.setItem('userData', JSON.stringify(response));
    
            alert("Authentication successful. You will be redirected to user.html.");
    
            // Redirect to user.html
            window.location.href = 'user.html';
        } else {
            alert("Error: " + response.message);
        }
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
});