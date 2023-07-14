package com.taylor.rest.Models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "feeding_data")
public class FeedingData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column
    private double amount_of_milk;

    @Column
    private Timestamp start_time;

    @Column
    private Timestamp end_time;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonBackReference
    private UserData user;

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public double getAmount_of_milk() {
        return amount_of_milk;
    }

    public void setAmount_of_milk(double amount_of_milk) {
        this.amount_of_milk = amount_of_milk;
    }

    public Timestamp getStart_time() {
        return start_time;
    }

    public void setStart_time(Timestamp start_time) {
        this.start_time = start_time;
    }

    public Timestamp getEnd_time() {
        return end_time;
    }

    public void setEnd_time(Timestamp end_time) {
        this.end_time = end_time;
    }

    public UserData getUser() {
        return user;
    }

    public void setUser(UserData user) {
        this.user = user;
    }
}
