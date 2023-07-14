package com.taylor.rest.Controllers;

import com.taylor.rest.Models.FeedingData;
import com.taylor.rest.Models.UserData;
import com.taylor.rest.Repositories.FeedingDataRepo;
import com.taylor.rest.Repositories.UserDataRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@RestController
@RequestMapping("/feedingData")
//@CrossOrigin(origins = "*")
public class FeedingController {

    @Autowired
    private FeedingDataRepo feedingDataRepo;

    @Autowired
    private UserDataRepo userDataRepo;

    @GetMapping(value = "/{userId}")
    public List<FeedingData> getFeedingData(
            @PathVariable long userId,
            @RequestParam Optional<Timestamp> start,
            @RequestParam Optional<Timestamp> end) {

        UserData user = userDataRepo.findById(userId).get();
        if (start.isPresent() || end.isPresent()) {
            Timestamp startDate = start.orElse(new Timestamp(0));
            Timestamp endDate = end.orElse(new Timestamp(System.currentTimeMillis()));
            return user.getFeedings().stream()
                    .filter(feeding -> feeding.getStart_time().after(startDate) && feeding.getEnd_time().before(endDate))
                    .collect(Collectors.toList());
        } else {
            return user.getFeedings();
        }
    }

    @GetMapping(value = "/{userId}/averageDuration")
    public Map<String, Object> getAverageDuration(
            @PathVariable long userId,
            @RequestParam Optional<String> start,
            @RequestParam Optional<String> end) {

        Optional<Timestamp> startTimestamp = start.isPresent() ? Optional.of(Timestamp.from(Instant.parse(start.get()))) : Optional.empty();
        Optional<Timestamp> endTimestamp = end.isPresent() ? Optional.of(Timestamp.from(Instant.parse(end.get()))) : Optional.empty();

        List<FeedingData> feedings = getFeedingData(userId, startTimestamp, endTimestamp);
        List<String> dates = new ArrayList<>();
        List<Long> durations = new ArrayList<>();

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd", Locale.ENGLISH);

        for (FeedingData feeding : feedings) {
            LocalDate startDate = feeding.getStart_time().toLocalDateTime().toLocalDate();
            LocalDate endDate = feeding.getEnd_time().toLocalDateTime().toLocalDate();
            String formattedStartDate = startDate.format(formatter);
            String formattedEndDate = endDate.format(formatter);
            dates.add(formattedStartDate + " - " + formattedEndDate);
            durations.add(feeding.getEnd_time().getTime() - feeding.getStart_time().getTime());
        }

        Map<String, Object> result = new HashMap<>();
        result.put("dates", dates);
        result.put("durations", durations);
        return result;
    }

    @GetMapping(value = "/{userId}/averageMilk")
    public Map<String, Object> getAverageMilkConsumed(
            @PathVariable long userId,
            @RequestParam Optional<String> start,
            @RequestParam Optional<String> end) {

        Optional<Timestamp> startTimestamp = start.isPresent() ? Optional.of(Timestamp.from(Instant.parse(start.get()))) : Optional.empty();
        Optional<Timestamp> endTimestamp = end.isPresent() ? Optional.of(Timestamp.from(Instant.parse(end.get()))) : Optional.empty();

        List<FeedingData> feedings = getFeedingData(userId, startTimestamp, endTimestamp);
        List<String> dates = new ArrayList<>();
        List<Double> milkAmounts = new ArrayList<>();

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd", Locale.ENGLISH);

        for (FeedingData feeding : feedings) {
            LocalDate startDate = feeding.getStart_time().toLocalDateTime().toLocalDate();
            String formattedDate = startDate.format(formatter);
            dates.add(formattedDate);
            milkAmounts.add(feeding.getAmount_of_milk());
        }

        Map<String, Object> result = new HashMap<>();
        result.put("dates", dates);
        result.put("milkAmounts", milkAmounts);
        return result;
    }

    @PostMapping(value = "/{userId}/save")
    public String saveFeedingData(@PathVariable long userId, @RequestBody FeedingData feedingData) {
        UserData user = userDataRepo.findById(userId).get();
        feedingData.setUser(user);
        feedingDataRepo.save(feedingData);
        return "{\"message\":\"Feeding data saved\", \"userId\":" + userId + "}";
    }

    @PutMapping(value = "/{userId}/update/{id}")
    public String updateFeedingData(@PathVariable long userId, @PathVariable long id, @RequestBody FeedingData feedingData) {
        UserData user = userDataRepo.findById(userId).get();
        FeedingData updatedFeedingData = user.getFeedings().stream()
                .filter(feeding -> feeding.getId() == id)
                .findFirst()
                .get();
        updatedFeedingData.setAmount_of_milk(feedingData.getAmount_of_milk());
        updatedFeedingData.setStart_time(feedingData.getStart_time());
        updatedFeedingData.setEnd_time(feedingData.getEnd_time());
        feedingDataRepo.save(updatedFeedingData);
        return "{\"message\":\"Feeding data updated\", \"userId\":\"" + userId + "\", \"id\":" + id + "}";
    }

    @DeleteMapping(value = "{userId}/delete/{id}")
    public String deleteFeedingData(@PathVariable long userId, @PathVariable long id) {
        UserData user = userDataRepo.findById(userId).get();
        FeedingData deleteFeedingData = user.getFeedings().stream()
                .filter(feeding -> feeding.getId() == id)
                .findFirst()
                .orElse(null);

        if (deleteFeedingData != null) {
            // Remove the feeding data from the user's feedings list
            user.getFeedings().remove(deleteFeedingData);
            userDataRepo.save(user);  // Update the user in the repository

            // Now try to delete the feeding data
            feedingDataRepo.delete(deleteFeedingData);
            return "{\"message\":\"Feeding data deleted\", \"userId\":\"" + userId + "\", \"id\":" + id + "}";
        } else {
            return "{\"message\":\"No feeding data found\"}";
        }
    }
}
