package com.taylor.rest.Controllers;

import com.taylor.rest.Models.FeedingData;
import com.taylor.rest.Models.UserData;
import com.taylor.rest.Repositories.UserDataRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/userData")
//@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserDataRepo userDataRepo;

    @PreAuthorize("hasPermission(#userId, 'User', 'read')")
    @GetMapping("/{userId}")
    public ResponseEntity<UserData> getUser(@PathVariable Long userId) {
        UserData user = userDataRepo.findById(userId).get();
        return new ResponseEntity<UserData>(user, HttpStatus.ACCEPTED);
    }

    @GetMapping(value = "/{userId}/feedings")
    public List<FeedingData> getUserFeedings(@PathVariable long userId) {
        UserData user = userDataRepo.findById(userId).get();
        return user.getFeedings();
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginUser(@RequestBody UserData userData) {
        Map<String, Object> response = new HashMap<>();
        String username = userData.getUsername();
        String password = userData.getPassword();

        UserData user = userDataRepo.findByUsername(username);
        if (user != null) {
            PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
            if (passwordEncoder.matches(password, user.getPassword())) {
                response.put("status", "success");
                response.put("userId", user.getId());
                response.put("username", user.getUsername());
                response.put("password", user.getPassword());
                response.put("role", user.getRole());

                return ResponseEntity.ok(response);
            }
        }

        response.put("status", "error");
        response.put("message", "Invalid credentials");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @PostMapping(value = "/save")
    public ResponseEntity<Map<String, Object>> saveUser(@RequestBody UserData userData) {
        Map<String, Object> response = new HashMap<>();
        System.out.println("User: " + userData);
        String username = userData.getUsername();

        // Simple check to see if the username already exists
        if(userDataRepo.findByUsername(username) != null){
            response.put("message", "Username already exists");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        String hashedPassword = passwordEncoder.encode(userData.getPassword());
        userData.setPassword(hashedPassword);
        UserData savedUser = userDataRepo.save(userData);

        response.put("status", "success");
        response.put("message", "User data saved");
        response.put("userId", savedUser.getId());
        response.put("username", savedUser.getUsername());
        response.put("password", savedUser.getPassword());
        response.put("role", savedUser.getRole());

        return ResponseEntity.ok(response);
    }

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PutMapping(value = "/update/{id}")
    public String updateUser(@PathVariable long id, @RequestBody UserData userData) {
        UserData updatedUserData = userDataRepo.findById(id).get();
        updatedUserData.setUsername(userData.getUsername());

        // Encode the new password before setting it
        String encodedPassword = passwordEncoder.encode(userData.getPassword());
        updatedUserData.setPassword(encodedPassword);

        updatedUserData.setRole(userData.getRole());
        userDataRepo.save(updatedUserData);
        return "{\"message\":\"User data updated\", \"id\":" + id + "}";
    }

    @DeleteMapping(value = "/delete/{id}")
    public String deleteUser(@PathVariable long id) {
        UserData deleteUserData = userDataRepo.findById(id).get();
        userDataRepo.delete(deleteUserData);
        return "{\"message\":\"User data deleted\", \"id\":" + id + "}";
    }
}
