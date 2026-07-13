package com.huskywusky.trailchecklist.model;

public record TripRequest(
        double miles,
        Terrain terrain,
        Season season,
        int elevationGainFt,
        boolean bringingDog,
        boolean overnight
) {
}
