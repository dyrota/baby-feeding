package com.taylor.rest.Repositories;

import com.taylor.rest.Models.UserData;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserDataRepo extends JpaRepository<UserData, Long> {

    UserData findByUsername(String username);

}