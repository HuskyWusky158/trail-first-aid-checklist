package com.huskywusky.trailchecklist.model;

public record ChecklistItem(String name, ChecklistCategory category, boolean essential, String note) {
}
