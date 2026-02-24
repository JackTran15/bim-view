export const SAMPLE_BIM_JSON = {
  "project": {
    "name": "Small 100sqm House",
      "units": "mm",
        "defaultWallHeight": 2800
  },
  "building": {
    "footprint": {
      "width": 10000,
        "depth": 10000
    },
    "levels": [
      {
        "level": 0,
        "elevation": 0,
        "height": 2800,

        "spaces": [
          {
            "id": "living_room",
            "name": "Living Room",
            "area": 28,
            "polygon": [[200, 200], [6200, 200], [6200, 4200], [200, 4200]]
          },
          {
            "id": "kitchen",
            "name": "Kitchen",
            "area": 12,
            "polygon": [[6200, 200], [9800, 200], [9800, 4200], [6200, 4200]]
          },
          {
            "id": "bedroom_1",
            "name": "Bedroom 1",
            "area": 16,
            "polygon": [[200, 4200], [4200, 4200], [4200, 7800], [200, 7800]]
          },
          {
            "id": "bedroom_2",
            "name": "Bedroom 2",
            "area": 14,
            "polygon": [[4200, 4200], [7600, 4200], [7600, 7800], [4200, 7800]]
          },
          {
            "id": "bathroom",
            "name": "Bathroom",
            "area": 8,
            "polygon": [[7600, 4200], [9800, 4200], [9800, 6500], [7600, 6500]]
          },
          {
            "id": "hall",
            "name": "Hallway",
            "area": 10,
            "polygon": [[7600, 6500], [9800, 6500], [9800, 9800], [7600, 9800]]
          },
          {
            "id": "entry",
            "name": "Entry",
            "area": 6,
            "polygon": [[200, 7800], [3000, 7800], [3000, 9800], [200, 9800]]
          }
        ],

        "walls": [
          {
            "id": "external_walls",
            "type": "perimeter",
            "thickness": 200,
            "height": 2800,
            "polygon": [[0, 0], [10000, 0], [10000, 10000], [0, 10000]]
          },
          {
            "id": "internal_wall_1",
            "type": "partition",
            "thickness": 120,
            "height": 2800,
            "path": [[6200, 200], [6200, 4200]]
          },
          {
            "id": "internal_wall_2",
            "type": "partition",
            "thickness": 120,
            "height": 2800,
            "path": [[4200, 4200], [4200, 7800]]
          },
          {
            "id": "internal_wall_3",
            "type": "partition",
            "thickness": 120,
            "height": 2800,
            "path": [[7600, 4200], [7600, 9800]]
          },
          { "id": "wall_living_bedroom1", "type": "partition", "thickness": 120, "height": 2800, "path": [[200, 4200], [4200, 4200]] },
          { "id": "wall_kitchen_bedroom2", "type": "partition", "thickness": 120, "height": 2800, "path": [[6200, 4200], [7600, 4200]] },
          { "id": "wall_bathroom_hall", "type": "partition", "thickness": 120, "height": 2800, "path": [[7600, 6500], [9800, 6500]] },
          { "id": "wall_bedroom1_entry", "type": "partition", "thickness": 120, "height": 2800, "path": [[200, 7800], [3000, 7800]] },
          { "id": "wall_entry_corridor", "type": "partition", "thickness": 120, "height": 2800, "path": [[3000, 7800], [3000, 9800]] },
          { "id": "wall_corridor_bedroom2", "type": "partition", "thickness": 120, "height": 2800, "path": [[3000, 7800], [7600, 7800]] }
        ],

        "doors": [
          { "id": "main_door", "width": 1000, "height": 2100, "position": [1500, 10000], "rotation": 180 },
          { "id": "bedroom1_door", "width": 900, "height": 2100, "position": [4200, 6000], "rotation": 90 },
          { "id": "living_bedroom1_door", "width": 900, "height": 2100, "position": [2500, 4200], "rotation": 0 },
          { "id": "bedroom2_corridor_door", "width": 800, "height": 2100, "position": [5000, 7800], "rotation": 0 },
          { "id": "bathroom_hall_door", "width": 800, "height": 2100, "position": [8500, 6500], "rotation": 0 },
          { "id": "entry_corridor_door", "width": 900, "height": 2100, "position": [3000, 8800], "rotation": 90 }
        ],

        "windows": [
          {
            "id": "living_window",
            "width": 2000,
            "height": 1200,
            "sillHeight": 900,
            "position": [3000, 0],
            "rotation": 0
          },
          {
            "id": "bedroom1_window",
            "width": 1500,
            "height": 1200,
            "sillHeight": 900,
            "position": [200, 5500],
            "rotation": 90
          }
        ],

        "slab": {
          "thickness": 200,
          "polygon": [[0, 0], [10000, 0], [10000, 10000], [0, 10000]]
        }
      }
    ]
  }
}