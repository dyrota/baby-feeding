package com.taylor.rest.Repositories;

import com.taylor.rest.Models.FeedingData;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FeedingDataRepo extends JpaRepository<FeedingData, Long> {

}
