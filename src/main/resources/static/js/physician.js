$(document).ready(function(){
    let userId;
    
    $("#submit-button").click(function() {
        // console.log("USER ID");
        userId = $("#user-id").val();
        // console.log(userId);

        if (userId) {
            loadFeedingData(userId);
            getAverageDuration(userId);
            getAverageMilk(userId);
        }
    });

    $("#filter-button").click(function() {
        // console.log("FILTERING");
        let startDate = $("#start-date").val();
        let endDate = $("#end-date").val();
        // console.log(startDate);
        // console.log(endDate);

        if (userId) {
            getAverageDuration(userId, startDate, endDate);
            getAverageMilk(userId, startDate, endDate);
        }
    });

    function getAuthHeaderFromToken() {
        let userToken = localStorage.getItem('userToken');

        if (userToken) {
            let userData = JSON.parse(userToken);
            let response = 'Basic ' + btoa(userData.username + ':' + userData.password);
            // console.log(response);
            return response;
        }
        return null;
    }

    function getUserIdFromToken() {
        let userToken = localStorage.getItem('userToken');
        // console.log('userToken:', userToken);
    
        if (userToken) {
            try {
                let userData = JSON.parse(userToken);
                // console.log('userData:', userData);
                if (userData && userData.userId) {
                    // console.log('userId:', userData.userId);
                    return userData.userId;
                }
            } catch (error) {
                console.error('Error parsing userToken:', error);
            }
        }
    
        alert('User not logged in');
        return null;
    }

    function loadFeedingData(userId) {
        // console.log("LOADING FEEDING DATA");
        let url = `/feedingData/${userId}`;
        if (userId) {
            $.ajax({
                url: url,
                type: "GET",
                dataType: 'json',
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('Authorization', getAuthHeaderFromToken());
                },
                success: function(response) {
                    // console.log("IT WORKED");
                    let tableBody = $("#feeding-data-table tbody");
                    tableBody.empty();
                    response.reverse();

                    for (let i = 0; i < response.length; i++) {
                        let entry = response[i];
                        let row = createDataRow(entry);
                        tableBody.append(row);
                    }
                },
                error: function(error) {
                    // console.log("IT FAILED " + error);
                    $("#response").text("Error: " + error.status + " " + error.statusText + "\n" + error.responseText);
                }
            });
        }
    }

    function createDataRow(entry) {
        let row = $("<tr></tr>").attr("data-id", entry.id);
        row.append($("<td></td>").addClass("amount-of-milk").text(entry.amount_of_milk));
        row.append($("<td></td>").addClass("start-time").text(new Date(entry.start_time).toLocaleString()));
        row.append($("<td></td>").addClass("end-time").text(new Date(entry.end_time).toLocaleString()));
        row.append($("<td></td>").addClass("duration").text(calculateDuration(entry.start_time, entry.end_time)));
        return row;
    }

    function calculateDuration(startTime, endTime) {
        let startDateTime = new Date(startTime);
        let endDateTime = new Date(endTime);
        let duration = endDateTime - startDateTime;
        let minutes = Math.floor(duration / 60000);
        let seconds = Math.floor((duration % 60000) / 1000);
        return minutes.toString().padStart(2, '0') + ":" + seconds.toString().padStart(2, '0');
    }

    function getAverageDuration(userId, startDate, endDate) {
        let url = "/feedingData/" + userId + "/averageDuration";
        if (startDate && endDate) {
            url += `?start=${new Date(startDate).toISOString()}&end=${new Date(endDate).toISOString()}`;
        }
        $.ajax({
            url: url,
            type: "GET",
            dataType: 'json',
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', getAuthHeaderFromToken());
            },
            success: function(response) {
                let ctx = document.getElementById('average-duration-chart').getContext('2d');
                let existingChart = Chart.getChart(ctx);
    
                if (existingChart) {
                    existingChart.destroy();
                }
    
                response.dates.sort();
    
                let chart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: response.dates,
                        datasets: [{
                            label: 'Average Duration (seconds)',
                            data: response.durations,
                            borderColor: '#5db8fc',
                            backgroundColor: '#0279d4',
                        }]
                    }
                });
            },
            error: function(error) {
                $("#response").text("Error: " + error.status + " " + error.statusText + "\n" + error.responseText);
            }
        });
    }

    function getAverageMilk(userId, startDate, endDate) {
        let url = "/feedingData/" + userId + "/averageMilk";
        if (startDate && endDate) {
            url += `?start=${new Date(startDate).toISOString()}&end=${new Date(endDate).toISOString()}`;
        }
        $.ajax({
            url: url,
            type: "GET",
            dataType: 'json',
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', getAuthHeaderFromToken());
            },
            success: function(response) {
                let ctx = document.getElementById('average-milk-chart').getContext('2d');
                let existingChart = Chart.getChart(ctx);
    
                if (existingChart) {
                    existingChart.destroy();
                }
    
                response.dates.sort();
    
                let chart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: response.dates,
                        datasets: [{
                            label: 'Average Milk Consumed (ml)',
                            data: response.milkAmounts, // Change this line
                            borderColor: '#5db8fc',
                            backgroundColor: '#0279d4',
                        }]
                    }
                });
            },
            error: function(error) {
                $("#response").text("Error: " + error.status + " " + error.statusText + "\n" + error.responseText);
            }
        });
    }
    
});