$(document).ready(function() {

    let userId = getUserIdFromToken();

    function getAuthHeaderFromToken() {
        let userToken = localStorage.getItem('userToken');

        if (userToken) {
            let userData = JSON.parse(userToken);
            let response = 'Basic ' + btoa(userData.username + ':' + userData.password);
            console.log(response);
            return response;
        }
        return null;
    }

    function getUserIdFromToken() {
        let userToken = localStorage.getItem('userToken');
        console.log('userToken:', userToken);

        if (userToken) {
            try {
                let userData = JSON.parse(userToken);
                console.log('userData:', userData);
                if (userData && userData.userId) {
                    console.log('userId:', userData.userId);
                    return userData.userId;
                }
            } catch (error) {
                console.error('Error parsing userToken:', error);
            }
        }

        alert('User not logged in');
        return null;
    }

    $("#update-button").click(function() {
        let newPassword = $("#new-password").val();

        if (newPassword) {
            let userData = JSON.parse(localStorage.getItem('userToken'));
            userData.password = newPassword;

            $.ajax({
                url: `http://localhost:8080/userData/update/${userData.userId}`,
                type: "PUT",
                dataType: 'json',
                contentType: 'application/json',
                data: JSON.stringify(userData),
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('Authorization', getAuthHeaderFromToken());
                },
                success: function(response) {
                    // Update the user token in the local storage with the new password
                    localStorage.setItem('userData', JSON.stringify(userData));
                    alert("User data updated successfully");
                },
                error: function(error) {
                    alert("Error: " + error.status + " " + error.statusText + "\n" + error.responseText);
                }
            });
        } else {
            alert("Please enter your new password.");
        }
    });

    $("#logout-button").click(function() {
        // Clear user data from local storage
        console.log("REMOVING USER DATA TOKENS");
        localStorage.removeItem('userData');
        localStorage.removeItem('userToken');

        // Redirect to the login page or refresh the current page to update the user state
        // location.reload();
        window.location.href='index.html'
    });

    let userData = JSON.parse(localStorage.getItem('userToken'));

    // Check if userData exists before proceeding
    if (userData) {

        let role = userData.role;
        console.log(role);

        let backButton = document.createElement("button");
        backButton.classList.add("btn");
        backButton.classList.add("btn-primary");
        backButton.addEventListener('click', function(){
            if (role === "PHYSICIAN") {
                window.location.href='physician.html';
            } else {
                window.location.href='admin.html';
            }
        });

        if (role === "PHYSICIAN") {
            backButton.textContent = "Back to Physician Page";
        } else {
            backButton.textContent = "Back to Patient Page";
        }

        document.querySelector('#back-button-container').prepend(backButton);
    } else {
        console.error('User data not found in local storage');
    }

});