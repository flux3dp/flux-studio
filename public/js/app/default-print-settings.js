define(function() {
    return {
        custom: `avoid_crossing_perimeters = 0
before_layer_gcode =
bottom_solid_layers = 3
bridge_acceleration = 0
bridge_fan_speed = 100
bridge_flow_ratio = 1
bridge_speed = 60
brim_width = 0
complete_objects = 0
cooling = 1
cura2 = 1
default_acceleration = 0
detect_filament_runout = 1
detect_head_tilt = 1
disable_fan_first_layers = 3
dont_support_bridges = 1
duplicate_distance = 6
end_gcode = G91\\nG1 E-20 F300\\nM104 S0\\nG90\\nM84\\n
external_fill_pattern = rectilinear
external_perimeter_extrusion_width = 0.4
external_perimeter_speed = 28
external_perimeters_first = 0
extra_perimeters = 1
extruder_clearance_height = 20
extruder_clearance_radius = 20
extrusion_axis = E
extrusion_multiplier = 1
extrusion_width = 0.4
fan_always_on = 0
fan_below_layer_time = 99
filament_colour = #FFFFFF
filament_diameter = 1.75
fill_angle = 45
fill_density = 10%
fill_pattern = honeycomb
first_layer_acceleration = 0
first_layer_bed_temperature = 0
first_layer_extrusion_width = 125%
first_layer_height = 0.4
first_layer_speed = 20
first_layer_temperature = 230
flux_calibration = 1
gap_fill_speed = 20
gcode_arcs = 0
gcode_comments = 0
gcode_flavor = reprap
geometric_error_correction_on = 1
infill_acceleration = 0
infill_every_layers = 1
infill_extruder = 1
infill_extrusion_width = 0.4
infill_first = 0
infill_only_where_needed = 0
infill_overlap = 30%
infill_speed = 60
interface_shells = 0
layer_gcode =
layer_height = 0.15
max_fan_speed = 100
max_print_speed = 80
max_volumetric_speed = 0
min_print_speed = 3
min_skirt_length = 0
notes =
nozzle_diameter = 0.4
only_retract_when_crossing_perimeters = 1
ooze_prevention = 0
overhangs = 0
pause_at_layers =
perimeter_acceleration = 0
perimeter_extruder = 1
perimeter_extrusion_width = 0.4
perimeter_speed = 40
perimeters = 3
post_process =
pressure_advance = 0
raft = 1
raft_layers = 4
resolution = 0.01
retract_before_travel = 2
retract_layer_change = 0
retract_length = 8
retract_length_toolchange = 10
retract_lift = 0.15
retract_restart_extra = 0
retract_restart_extra_toolchange = 0
retract_speed = 80
seam_position = aligned
skirt_distance = 10
skirt_height = 1
skirts = 0
slowdown_below_layer_time = 15
small_perimeter_speed = 15
solid_infill_below_area = 1
solid_infill_every_layers = 0
solid_infill_extruder = 1
solid_infill_extrusion_width = 0.4
solid_infill_speed = 20
spiral_vase = 0
standby_temperature_delta = -5
start_gcode = G1 F6000 Z50\\nG92 Z49.9\\nG92 E0 ;zero the extruded length\\nG1 F2400 E-4.50000\\nG0 F9000 X-63.184 Y-57.431\\nG0 F9000 Z0.800\\nG1 F2400 E0.00000\\nG1 F600 X-68.813 Y-50.551 E2.36528\\nG1 X-77.780 Y-35.227 E7.09590\\nG1 X-83.384 Y-18.380 E11.82647\\nG1 X-85.384 Y-0.738 E16.55716\\nG1 X-83.693 Y16.934 E21.28723\\nG1 X-78.383 Y33.877 E26.01807\\nG1 X-69.685 Y49.355 E30.74862\\nG1 X-57.975 Y62.701 E35.47929\\nG1 X-43.757 Y73.336 E40.21008\\nG1 X-27.649 Y80.802 E44.94053\\nG1 X-10.345 Y84.776 E49.67108\\nG1 X7.407 Y85.086 E54.40166\\nG1 X24.838 Y81.718 E59.13191\\nG1 X41.198 Y74.819 E63.86265\\nG1 X55.778 Y64.686 E68.59345\\nG1 X67.947 Y51.758 E73.32398\\nG1 X77.179 Y36.593 E78.05439\\nG1 X83.077 Y19.846 E82.78515\\nG1 X85.383 Y2.241 E87.51594\\nG1 X84.001 Y-15.458 E92.24605\\nG1 X78.988 Y-32.490 E96.97657\\nG1 X70.562 Y-48.119 E101.70744\\nG1 X59.086 Y-61.666 E106.43796\\nG1 X45.057 Y-72.548 E111.16858\\nG1 X29.081 Y-80.294 E115.89920\\nG1 X11.848 Y-84.570 E120.63003\\nG1 X3.392 Y-85.306 E122.88852\\nG92 E0
support_everywhere = 0
support_material = 0
support_material_angle = 0
support_material_contact_distance = 0.3
support_material_enforce_layers = 0
support_material_extruder = 1
support_material_extrusion_width = 0.4
support_material_interface_extruder = 1
support_material_interface_layers = 3
support_material_interface_spacing = 0
support_material_interface_speed = 100%
support_material_pattern = LINES
support_material_spacing = 1.7
support_material_speed = 40
support_material_threshold = 37
temperature = 200
thin_walls = 1
threads = 4
toolchange_gcode =
top_infill_extrusion_width = 0.27
top_solid_infill_speed = 15
top_solid_layers = 4
travel_speed = 80
use_firmware_retraction = 0
use_relative_e_distances = 0
use_volumetric_e = 0
vibration_limit = 0
wipe = 0
xy_size_compensation = -0.07
z_offset = 0`,
    fd1p: {
        high: {
            "layer_height": 0.075,
            "travel_speed": 120,
            "infill_speed": 100,
            "retract_lift" : 0.05,
            "temperature": 200,
            "perimeter_speed": 50,
            "external_perimeter_speed": 35,
            "first_layer_temperature": 230
        },
        med: {
            "layer_height": 0.15,
            "travel_speed": 150,
            "infill_speed": 60,
            "retract_lift" : 0.05,
            "temperature": 200,
            "perimeter_speed": 50,
            "external_perimeter_speed": 35,
            "first_layer_temperature": 230
        },
        low: {
            "layer_height": 0.3,
            "travel_speed": 150,
            "infill_speed": 65,
            "retract_lift" : 0.05,
            "temperature": 215,
            "perimeter_speed": 50,
            "external_perimeter_speed": 35,
            "first_layer_temperature": 230
        }
    },
    fd1: {
        high: {
            "layer_height": 0.075,
            "travel_speed": 80,
            "infill_speed": 60,
            "retract_lift" : 0.24,
            "temperature": 200,
            "perimeter_speed": 40,
            "external_perimeter_speed": 28,
            "first_layer_temperature": 230
        },
        med: {
            "layer_height": 0.15,
            "travel_speed": 100,
            "infill_speed": 60,
            "retract_lift" : 0.24,
            "temperature": 200,
            "perimeter_speed": 40,
            "external_perimeter_speed": 28,
            "first_layer_temperature": 230
        },
        low: {
            "layer_height": 0.3,
            "travel_speed": 120,
            "infill_speed": 30,
            "retract_lift" : 0.24,
            "temperature": 215,
            "perimeter_speed": 40,
            "external_perimeter_speed": 28,
            "first_layer_temperature": 230
        }
    }
  }
});
