package com.huskywusky.trailchecklist.service;

import com.huskywusky.trailchecklist.model.ChecklistCategory;
import com.huskywusky.trailchecklist.model.ChecklistItem;
import com.huskywusky.trailchecklist.model.Season;
import com.huskywusky.trailchecklist.model.Terrain;
import com.huskywusky.trailchecklist.model.TripRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ChecklistGenerator {

    public List<ChecklistItem> generate(TripRequest trip) {
        List<ChecklistItem> items = new ArrayList<>();

        items.add(new ChecklistItem("Map / GPS device", ChecklistCategory.NAVIGATION, true, null));
        items.add(new ChecklistItem("Trail permit / park pass", ChecklistCategory.NAVIGATION, false, null));
        items.add(new ChecklistItem("Headlamp + spare batteries", ChecklistCategory.GEAR, true, null));
        items.add(new ChecklistItem("Water (2L minimum)", ChecklistCategory.FOOD_WATER, true,
                "Add 0.5L per additional 5 miles"));
        items.add(new ChecklistItem("High-calorie snacks / trail food", ChecklistCategory.FOOD_WATER, true, null));

        items.add(new ChecklistItem("Adhesive bandages, assorted sizes", ChecklistCategory.FIRST_AID, true, null));
        items.add(new ChecklistItem("Gauze pads + medical tape", ChecklistCategory.FIRST_AID, true, null));
        items.add(new ChecklistItem("Elastic wrap (for sprains/splinting)", ChecklistCategory.FIRST_AID, true, null));
        items.add(new ChecklistItem("Tweezers + irrigation syringe", ChecklistCategory.FIRST_AID, true,
                "For splinters, ticks, and wound cleaning"));
        items.add(new ChecklistItem("Emergency blanket", ChecklistCategory.FIRST_AID, true, null));

        if (trip.miles() >= 8 || trip.terrain() == Terrain.STRENUOUS) {
            items.add(new ChecklistItem("Trekking poles", ChecklistCategory.GEAR, false, null));
            items.add(new ChecklistItem("SAM splint", ChecklistCategory.FIRST_AID, true,
                    "Long/remote trips raise the odds of a fracture or severe sprain before you can reach help"));
        }

        if (trip.elevationGainFt() >= 2000) {
            items.add(new ChecklistItem("Extra insulating layer", ChecklistCategory.GEAR, true,
                    "Temperature drops roughly 3-5°F per 1000 ft of elevation gain"));
        }

        if (trip.season() == Season.SUMMER) {
            items.add(new ChecklistItem("Electrolyte tablets", ChecklistCategory.FOOD_WATER, true,
                    "Heat exhaustion risk: watch for heavy sweating, cool/clammy skin, dizziness. "
                            + "Heat stroke is hot/dry skin with confusion — a true emergency, cool immediately and evacuate"));
            items.add(new ChecklistItem("Sun protection (SPF, hat, sunglasses)", ChecklistCategory.GEAR, true, null));
        }

        if (trip.season() == Season.WINTER) {
            items.add(new ChecklistItem("Hand/foot warmers", ChecklistCategory.GEAR, true, null));
            items.add(new ChecklistItem("Insulated layers + waterproof shell", ChecklistCategory.GEAR, true,
                    "Watch for frostbite (numb, waxy, pale skin) and hypothermia (shivering, slurred speech, fumbling hands)"));
        }

        if (trip.overnight()) {
            items.add(new ChecklistItem("Shelter (tent/bivy)", ChecklistCategory.GEAR, true, null));
            items.add(new ChecklistItem("Sleeping bag rated for conditions", ChecklistCategory.GEAR, true, null));
            items.add(new ChecklistItem("Water filter/purification", ChecklistCategory.FOOD_WATER, true, null));
        }

        if (trip.bringingDog()) {
            items.add(new ChecklistItem("Dog water bowl + extra water", ChecklistCategory.DOG, true, null));
            items.add(new ChecklistItem("Dog first-aid: vet wrap + tick key", ChecklistCategory.DOG, true, null));
            items.add(new ChecklistItem("Proof of vaccination", ChecklistCategory.DOG, false,
                    "Required on many trails"));
            items.add(new ChecklistItem("Paw protection (booties or paw wax)", ChecklistCategory.DOG, false,
                    "Consider for hot pavement/rocky or icy terrain"));
        }

        return items;
    }
}
