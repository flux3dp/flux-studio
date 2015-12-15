define(function() {
    'use strict';

    return {
        i18n : {
            default_lang : 'en',
            supported_langs : {
                'en' : 'English',
                'zh-tw' : '繁體中文'
            }
        },

        needWebGL: ['print', 'scan'],

        params: {
            printing : {

            }
        },

        custom: `avoid_crossing_perimeters = 0
before_layer_gcode =
bottom_solid_layers = 3
bridge_acceleration = 0
bridge_fan_speed = 100
bridge_flow_ratio = 1
bridge_speed = 40
brim_width = 0
complete_objects = 0
cooling = 1
default_acceleration = 0
disable_fan_first_layers = 5
dont_support_bridges = 1
duplicate_distance = 6
end_gcode = M104 S0 ; turn off temperature\\nG28 X0  ; home X axis\\nM84     ; disable motors
external_fill_pattern = rectilinear
external_perimeter_extrusion_width = 0.4
external_perimeter_speed = 21
external_perimeters_first = 0
extra_perimeters = 1
extruder_clearance_height = 20
extruder_clearance_radius = 20
extrusion_axis = E
extrusion_multiplier = 1
extrusion_width = 0.4
fan_always_on = 0
fan_below_layer_time = 15
filament_diameter = 1.75
fill_angle = 45
fill_density = 20%
fill_pattern = honeycomb
first_layer_acceleration = 0
first_layer_extrusion_width = 120%
first_layer_height = 0.35
first_layer_speed = 20
first_layer_temperature = 220
gap_fill_speed = 20
gcode_arcs = 0
infill_acceleration = 0
infill_every_layers = 1
infill_extruder = 1
infill_extrusion_width = 0.4
infill_first = 0
infill_only_where_needed = 0
infill_overlap = 15%
infill_speed = 50
interface_shells = 0
layer_gcode =
layer_height = 0.2
max_fan_speed = 100
max_print_speed = 50
max_volumetric_speed = 0
min_print_speed = 10
min_skirt_length = 0
nozzle_diameter = 0.4
only_retract_when_crossing_perimeters = 0
ooze_prevention = 0
output_filename_format = [input_filename_base].gcode
overhangs = 0
perimeter_acceleration = 0
perimeter_extruder = 1
perimeter_extrusion_width = 0.4
perimeter_speed = 30
perimeters = 3
post_process =
pressure_advance = 0
raft = 1
raft = 4
raft_layers = 4
resolution = 0.01
retract_before_travel = 2
retract_layer_change = 0
retract_length = 5.5
retract_length_toolchange = 10
retract_lift = 0.3
retract_restart_extra = 0
retract_restart_extra_toolchange = 0
retract_speed = 60
seam_position = aligned
skirt_distance = 20
skirt_height = 1
skirts = 1
slowdown_below_layer_time = 15
small_perimeter_speed = 15
solid_infill_below_area = 70
solid_infill_every_layers = 0
solid_infill_extruder = 1
solid_infill_extrusion_width = 0.4
solid_infill_speed = 20
spiral_vase = 0
standby_temperature_delta = -5
start_gcode = G28 ; home all axes\\nG1 Z5 F5000 ; lift nozzle
support_material = 1
support_material_angle = 0
support_material_contact_distance = 0.2
support_material_enforce_layers = 0
support_material_extruder = 1
support_material_extrusion_width = 0.4
support_material_interface_extruder = 1
support_material_interface_layers = 3
support_material_interface_spacing = 0
support_material_interface_speed = 100%
support_material_pattern = rectilinear-grid
support_material_spacing = 2
support_material_speed = 40
support_material_threshold = 55
temperature = 220
thin_walls = 1
threads = 8
toolchange_gcode =
top_infill_extrusion_width = 0.4
top_solid_infill_speed = 15
top_solid_layers = 3
travel_speed = 80
use_firmware_retraction = 0
use_relative_e_distances = 0
use_volumetric_e = 0
vibration_limit = 0
wipe = 0
xy_size_compensation = 0
z_offset = 0`
    };
});
