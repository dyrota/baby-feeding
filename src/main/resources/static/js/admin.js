$(document).ready(function(){
    let timer;
    let startTime;
    let userId = getUserIdFromToken();
    
    if (userId) {
        loadFeedingData();
        getAverageDuration(userId);
        getAverageMilk(userId);
    }

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
      
    function startTimer() {
        clearInterval(timer);
        startTime = Date.now();
        timer = setInterval(updateTimer, 1000);
        $("#start-button").text("Stop");
    }

    function stopTimer() {
        clearInterval(timer);
        timer = null;
        $("#start-button").text("Start");
    }

    function updateTimer() {
        let elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        let minutes = Math.floor(elapsedTime / 60);
        let seconds = elapsedTime % 60;
        $("#timer").text(minutes.toString().padStart(2, '0') + ":" + seconds.toString().padStart(2, '0'));
    }

    function bindStartButtonListener() {
        $("#start-button").off("click").on("click", function() {
            if (timer) {
                stopTimer();
            } else {
                startTimer();
            }
        });
    }

    function loadFeedingData() {
        let userId = getUserIdFromToken();
        if (userId) {
            $.ajax({
                url: "/feedingData/" + userId,
                type: "GET",
                dataType: 'json',
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('Authorization', getAuthHeaderFromToken());
                },
                success: function(response) {
                    console.log("LOADING FEEDING DATA");
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
        row.append($("<td></td>").html('<button class="edit-button btn-primary" data-id="' + entry.id + '">Edit</button>'));
        row.append($("<td></td>").html('<button class="delete-button btn-outline-secondary" data-id="' + entry.id + '">Delete</button>'));
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

    function deleteEntry(id) {
        let userId = getUserIdFromToken();
        if (userId) {
            $.ajax({
                url: "/feedingData/" + userId + "/delete/" + id,
                type: "DELETE",
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('Authorization', getAuthHeaderFromToken());
                },
                success: function(response) {
                    loadFeedingData();
                },
                error: function(error) {
                    $("#response").text("Error: " + error.status + " " + error.statusText + "\n" + error.responseText);
                }
            });
        }
    }

    function editEntry(id) {
        let row = $("tr[data-id='" + id + "']");
        let amountOfMilk = row.find(".amount-of-milk").text();
        let startTime = row.find(".start-time").text();
        let endTime = row.find(".end-time").text();
    
        row.empty();
        row.append($("<td></td>").html('<input type="number" class="edit-amount-of-milk" value="' + amountOfMilk + '">'));
        row.append($("<td></td>").html('<input type="text" class="edit-start-time" value="' + startTime + '">'));
        row.append($("<td></td>").html('<input type="text" class="edit-end-time" value="' + endTime + '">'));
        row.append($("<td></td>").html('<input type="text" class="edit-duration" disabled value="' + calculateDuration(startTime, endTime) + '">'));
        row.append($("<td></td>").html('<button class="save-button btn-primary" data-id="' + id + '">Save</button>'));
        row.append($("<td></td>").html('<button class="cancel-button btn-outline-secondary" data-id="' + id + '">Cancel</button>'));
    }
    
    function cancelEdit(id) {
        let row = $("tr[data-id='" + id + "']");
        let amountOfMilk = row.find(".edit-amount-of-milk").val();
        let startTime = row.find(".edit-start-time").val();
        let endTime = row.find(".edit-end-time").val();

        row.empty();
        row.append($("<td></td>").addClass("amount-of-milk").text(amountOfMilk));
        row.append($("<td></td>").addClass("start-time").text(startTime));
        row.append($("<td></td>").addClass("end-time").text(endTime));
        row.append($("<td></td>").addClass("duration").text(calculateDuration(startTime, endTime)));
        row.append($("<td></td>").html('<button class="edit-button btn-primary" data-id="' + id + '">Edit</button>'));
        row.append($("<td></td>").html('<button class="delete-button btn-outline-secondary" data-id="' + id + '">Delete</button>'));
    }

    function getAverageDuration(userId, startDate, endDate) {
        let url = "/feedingData/" + userId + "/averageDuration";
        console.log("AVG DURATION UserID: " + userId);
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

                let durationInSeconds = response.durations.map(duration => duration / 1000);
    
                let chart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: response.dates,
                        datasets: [{
                            label: 'Average Duration (seconds)',
                            data: durationInSeconds,
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
        console.log("UserID: " + userId);
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
                            data: response.milkAmounts,
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
    
    function saveEntry(id) {
        let row = $("tr[data-id='" + id + "']");
        let amountOfMilk = row.find(".edit-amount-of-milk").val();
        let startTime = row.find(".edit-start-time").val();
        let endTime = row.find(".edit-end-time").val();
        let startDateTime = new Date(startTime);
        let endDateTime = new Date(endTime);
        let startDateTimeStr = startDateTime.toISOString().split("T")[0] + "T00:00:00Z";
        let endDateTimeStr = endDateTime.toISOString().split("T")[0] + "T00:00:00Z";

        let feedingData = {
            amount_of_milk: amountOfMilk,
            start_time: startDateTimeStr,
            end_time: endDateTimeStr
        };

        let userId = getUserIdFromToken();
        if (userId) {
            $.ajax({
                url: "/feedingData/" + userId + "/update/" + id,
                type: "PUT",
                headers: {
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify(feedingData),
                dataType: 'json',
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('Authorization', getAuthHeaderFromToken());
                },
                success: function(response) {
                    loadFeedingData();
                    getAverageDuration(userId);
                    getAverageMilk(userId);
                },
                error: function(error) {
                    $("#response").text("Error: " + error.status + " " + error.statusText + "\n" + error.responseText);
                }
            });
        }
    }

    $("#submit-button").click(function() {
        clearInterval(timer);
        $("#start-button").text("Start");
        $("#timer").text("00:00");

        let amountOfMilk = $("#amount-of-milk").val();

        let feedingData = {
            amount_of_milk: amountOfMilk,
            start_time: startTime,
            end_time: Date.now()
        };

        let userId = getUserIdFromToken();
        console.log("SUBMIT BUTTON USER ID: " + userId);
        if (userId) {
            $.ajax({
                url: "/feedingData/" + userId + "/save",
                type: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify(feedingData),
                dataType: 'json',
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('Authorization', getAuthHeaderFromToken());
                },
                success: function(response) {
                    $("#response").text(JSON.stringify(response, null, 2));
                    loadFeedingData();
                    $("#amount-of-milk").val("");
                    startTime = Date.now();

                    getAverageDuration(userId);
                    getAverageMilk(userId);
                },
                error: function(error) {
                    $("#response").text("Error: " + error.status + " " + error.statusText + "\n" + error.responseText);
                }
            });
        }
    });

    $("#filter-button").click(function() {
        console.log("FILTERING");
        let startDate = $("#start-date").val();
        let endDate = $("#end-date").val();
        console.log(startDate);
        console.log(endDate);

        let userId = getUserIdFromToken();
        if (userId) {
            getAverageDuration(userId, startDate, endDate);
            getAverageMilk(userId, startDate, endDate);
        }
    });

    $("#start-button").click(function() {
        if (timer) {
            stopTimer();
        } else {
            startTimer();
        }
    });

    $(document).on('click', '.delete-button', function() {
        let id = $(this).data('id');
        deleteEntry(id);
    });

    $(document).on('click', '.edit-button', function() {
        let id = $(this).data('id');
        editEntry(id);
    });

    $(document).on('click', '.save-button', function() {
        let id = $(this).data('id');
        saveEntry(id);
    });

    $(document).on('click', '.cancel-button', function() {
        let id = $(this).data('id');
        cancelEdit(id);
    });
    
    bindStartButtonListener();
});