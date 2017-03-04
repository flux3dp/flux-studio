define(function() {
    return {
        defaultSetting: true,
        custom: `avoid_crossing_perimeters = 0
before_layer_gcode =
bottom_solid_layers = 5
bridge_acceleration = 0
bridge_fan_speed = 100
bridge_flow_ratio = 1
bridge_speed = 15
brim_width = 0
complete_objects = 0
cooling = 1
cut_bottom = 0
cura2 = 0
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
start_gcode = G1 F6000 Z50\\nG92 Z49.9\\nG92 E0 \\nG1 F2400 E-4.50000\\nG0 F9000 X85.384 Y-0.738\\nG0 F9000 Z0.8\\nG1 F2400 E0\\nG92 E16.55716\\nG1 F600 X83.693 Y16.934 E21.28723\\nG1 X78.383 Y33.877 E26.01807\\nG1 X69.685 Y49.355 E30.74862\\nG1 X57.975 Y62.701 E35.47929\\nG1 X43.757 Y73.336 E40.21008\\nG1 X27.649 Y80.802 E44.94053\\nG1 X10.345 Y84.776 E49.67108\\nG1 X-7.407 Y85.086 E54.40166\\nG1 X-24.838 Y81.718 E59.13191\\nG1 X-41.198 Y74.819 E63.86265\\nG1 X-55.778 Y64.686 E68.59345\\nG1 X-67.947 Y51.758 E73.32398\\nG1 X-77.179 Y36.593 E78.05439\\nG1 X-83.077 Y19.846 E82.78515\\nG1 X-85.383 Y2.241 E87.51594\\nG1 X-84.001 Y-15.458 E92.24605\\nG1 X-78.988 Y-32.490 E96.97657\\nG1 X-70.562 Y-48.119 E101.70744\\nG1 X-59.086 Y-61.666 E106.43796\\nG1 X-45.057 Y-72.548 E111.16858\\nG1 X-29.081 Y-80.294 E115.89920\\nG1 X-11.848 Y-84.570 E120.63003\\nG1 X-3.392 Y-85.306 E122.88852\\nG92 E0
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
top_solid_layers = 5
travel_speed = 150
use_firmware_retraction = 0
use_relative_e_distances = 0
use_volumetric_e = 0
vibration_limit = 0
wipe = 0
xy_size_compensation = -0.07
z_offset = 0`,
customCura2: `acceleration_enabled = false
acceleration_infill = 3000
acceleration_prime_tower = 3000
acceleration_print_layer_0 = 3000
acceleration_skirt_brim = 3000
acceleration_support_infill = 3000
acceleration_support_interface = 3000
acceleration_topbottom = 3000
acceleration_travel = 5000
acceleration_travel_layer_0 = 5000
acceleration_wall_0 = 3000
acceleration_wall_x = 3000
adhesion_extruder_nr = 0
adhesion_type = brim
alternate_carve_order = true
alternate_extra_perimeter = false
anti_overhang_mesh = false
bottom_layers = 5
brim_line_count = 20
brim_outside_only = true
carve_multiple_volumes = false
coasting_enable = false
coasting_min_volume = 0.8
coasting_speed = 90
coasting_volume = 0.064
conical_overhang_angle = 50
conical_overhang_enabled = false
cool_fan_enabled = true
cool_fan_full_layer = 2
cool_fan_speed_0 = 0
cool_fan_speed_max = 100
cool_fan_speed_min = 100
cool_lift_head = false
cool_min_layer_time = 5
cool_min_layer_time_fan_speed_max = 10
cool_min_speed = 10
cut_bottom = 0
default_material_print_temperature = 205
draft_shield_dist = 10
draft_shield_enabled = false
draft_shield_height = 10
draft_shield_height_limitation = full
dual_pre_wipe = true
extruder_prime_pos_abs = false
extruder_prime_pos_x = 0
extruder_prime_pos_y = 0
extruder_prime_pos_z = 0
fill_perimeter_gaps = everywhere
gradual_infill_step_height = 5
gradual_infill_steps = 0
infill_before_walls = false
infill_hollow = false
infill_line_distance = 2
infill_line_width = 0.4
infill_mesh = false
infill_mesh_order = 0
infill_overlap_mm = 0.04
infill_pattern = zigzag
infill_sparse_thickness = 0.15
infill_wipe_dist = 0.1
jerk_enabled = false
jerk_infill = 20
jerk_prime_tower = 20
jerk_print_layer_0 = 20
jerk_skirt_brim = 20
jerk_support_infill = 20
jerk_support_interface = 20
jerk_topbottom = 20
jerk_travel = 30
jerk_travel_layer_0 = 30
jerk_wall_0 = 20
jerk_wall_x = 20
layer_0_z_overlap = 0.15
layer_height = 0.15
layer_height_0 = 0.3
layer_start_x = 0
layer_start_y = 0
machine_disallowed_areas = 
machine_end_gcode = G91\\nG1 E-20 F300\\nM104 S0\\nG90\\nM84\\n
machine_min_cool_heat_time_window = 50
machine_start_gcode = G1 F6000 Z50\\nG92 Z49.9\\nG92 E0 \\nG1 F2400 E-4.50000\\nG0 F9000 X85.384 Y-0.738\\nG0 F9000 Z0.8\\nG1 F2400 E0\\nG92 E16.55716\\nG1 F600 X83.693 Y16.934 E21.28723\\nG1 X78.383 Y33.877 E26.01807\\nG1 X69.685 Y49.355 E30.74862\\nG1 X57.975 Y62.701 E35.47929\\nG1 X43.757 Y73.336 E40.21008\\nG1 X27.649 Y80.802 E44.94053\\nG1 X10.345 Y84.776 E49.67108\\nG1 X-7.407 Y85.086 E54.40166\\nG1 X-24.838 Y81.718 E59.13191\\nG1 X-41.198 Y74.819 E63.86265\\nG1 X-55.778 Y64.686 E68.59345\\nG1 X-67.947 Y51.758 E73.32398\\nG1 X-77.179 Y36.593 E78.05439\\nG1 X-83.077 Y19.846 E82.78515\\nG1 X-85.383 Y2.241 E87.51594\\nG1 X-84.001 Y-15.458 E92.24605\\nG1 X-78.988 Y-32.490 E96.97657\\nG1 X-70.562 Y-48.119 E101.70744\\nG1 X-59.086 Y-61.666 E106.43796\\nG1 X-45.057 Y-72.548 E111.16858\\nG1 X-29.081 Y-80.294 E115.89920\\nG1 X-11.848 Y-84.570 E120.63003\\nG1 X-3.392 Y-85.306 E122.88852\\nG92 E0
magic_fuzzy_skin_enabled = false
magic_fuzzy_skin_point_dist = 0.8
magic_fuzzy_skin_thickness = 0.3
magic_mesh_surface_mode = normal
magic_spiralize = false
material_bed_temp_prepend = true
material_bed_temp_wait = true
material_bed_temperature = 60
material_bed_temperature_layer_0 = 60
material_diameter = 1.75
material_extrusion_cool_down_speed = 0.7
material_final_print_temperature = 195
material_flow = 100
material_flow_dependent_temperature = false
material_flow_temp_graph = [[3.5,200],[7.0,240]]
material_initial_print_temperature = 200
material_print_temp_prepend = true
material_print_temp_wait = true
material_print_temperature = 200
material_print_temperature_layer_0 = 230
material_standby_temperature = 150
max_feedrate_z_override = 0
meshfix_extensive_stitching = false
meshfix_keep_open_polygons = false
meshfix_union_all = true
meshfix_union_all_remove_holes = false
min_infill_area = 0
multiple_mesh_overlap = 0.15
nozzle_disallowed_areas = 
ooze_shield_angle = 60
ooze_shield_dist = 2
ooze_shield_enabled = false
outer_inset_first = false
prime_tower_enable = false
prime_tower_flow = 100
prime_tower_line_width = 0.4
prime_tower_position_x = 200
prime_tower_position_y = 200
prime_tower_size = 15
prime_tower_wall_thickness = 2
prime_tower_wipe_enabled = true
print_sequence = all_at_once
raft = 0
raft_airgap = 0.3
raft_base_acceleration = 3000
raft_base_fan_speed = 0
raft_base_jerk = 20
raft_base_line_spacing = 1.6
raft_base_line_width = 1
raft_base_speed = 15
raft_base_thickness = 0.36
raft_interface_acceleration = 3000
raft_interface_fan_speed = 0
raft_interface_jerk = 20
raft_interface_line_spacing = 0.9
raft_interface_line_width = 0.8
raft_interface_speed = 15
raft_interface_thickness = 0.225
raft_margin = 5
raft_surface_acceleration = 3000
raft_surface_fan_speed = 0
raft_surface_jerk = 20
raft_surface_layers = 4
raft_surface_line_spacing = 0.4
raft_surface_line_width = 0.4
raft_surface_speed = 20
raft_surface_thickness = 0.1
retract_at_layer_change = false
retraction_amount = 8
retraction_combing = all
retraction_count_max = 90
retraction_enable = true
retraction_extra_prime_amount = 0
retraction_extrusion_window = 8
retraction_hop = 0.05
retraction_hop_after_extruder_switch = true
retraction_hop_enabled = true
retraction_hop_only_when_collides = false
retraction_min_travel = 0.8
retraction_prime_speed = 60
retraction_retract_speed = 60
skin_alternate_rotation = false
skin_line_width = 0.4
skin_no_small_gaps_heuristic = true
skin_outline_count = 0
skin_overlap_mm = 0.02
skirt_brim_line_width = 0.4
skirt_brim_minimal_length = 250
skirt_brim_speed = 30
skirt_gap = 3
skirt_line_count = 1
speed_equalize_flow_enabled = false
speed_equalize_flow_max = 150
speed_infill = 80
speed_prime_tower = 60
speed_print_layer_0 = 30
speed_slowdown_layers = 2
speed_support_infill = 80
speed_support_interface = 40
speed_topbottom = 15
speed_travel = 150
speed_travel_layer_0 = 56.25
speed_wall_0 = 28
speed_wall_x = 40
start_layers_at_same_position = true
sub_div_rad_add = 0.4
sub_div_rad_mult = 100
support_angle = 53
support_bottom_distance = 0.15
support_bottom_height = 1
support_bottom_stair_step_height = 0.3
support_conical_angle = 30
support_conical_enabled = false
support_conical_min_width = 5
support_connect_zigzags = true
support_enable = false
support_extruder_nr_layer_0 = 0
support_infill_extruder_nr = 0
support_interface_enable = false
support_interface_extruder_nr = 0
support_interface_line_distance = 0.4
support_interface_line_width = 0.4
support_interface_pattern = concentric
support_interface_skip_height = 0.3
support_join_distance = 2
support_line_distance = 2.66
support_line_width = 0.4
support_mesh = false
support_minimal_diameter = 3
support_offset = 0.2
support_pattern = lines
support_roof_height = 1
support_top_distance = 0.15
support_tower_diameter = 3
support_tower_roof_angle = 65
support_type = everywhere
support_use_towers = true
support_xy_distance = 0.7
support_xy_distance_overhang = 0.2
support_xy_overrides_z = z_overrides_xy
switch_extruder_prime_speed = 20
switch_extruder_retraction_amount = 20
switch_extruder_retraction_speed = 20
top_bottom_pattern = lines
top_bottom_pattern_0 = lines
top_layers = 5
travel_avoid_distance = 0.625
travel_avoid_other_parts = true
travel_compensate_overlapping_walls_0_enabled = true
travel_compensate_overlapping_walls_x_enabled = true
wall_0_inset = 0
wall_0_wipe_dist = 0.2
wall_line_count = 3
wall_line_width_0 = 0.4
wall_line_width_x = 0.4
wireframe_bottom_delay = 0
wireframe_drag_along = 0.6
wireframe_enabled = false
wireframe_fall_down = 0.5
wireframe_flat_delay = 0.1
wireframe_flow_connection = 100
wireframe_flow_flat = 100
wireframe_height = 3
wireframe_nozzle_clearance = 1
wireframe_printspeed_bottom = 5
wireframe_printspeed_down = 5
wireframe_printspeed_flat = 5
wireframe_printspeed_up = 5
wireframe_roof_drag_along = 0.8
wireframe_roof_fall_down = 2
wireframe_roof_inset = 3
wireframe_roof_outer_delay = 0.2
wireframe_straight_before_down = 20
wireframe_strategy = compensate
wireframe_top_delay = 0
wireframe_top_jump = 0.6
wireframe_up_half_speed = 0.3
xy_offset = -0.07
z_offset = 0
z_seam_type = shortest
z_seam_x = 85
z_seam_y = 510
# FLUX Machine Parameters
cut_bottom = 0
detect_filament_runout = 1		
detect_head_tilt = 1
detect_head_shake = 1
flux_calibration = 1
geometric_error_correction_on = 1
pause_at_layers =
temperature = 200	
z_offset = 0`,
    fd1p: {
        high: {
            "layer_height": 0.075,
            "travel_speed": 120,
            "infill_speed": 80,
            "support_material_speed": 80,
            "retract_lift" : 0.05,
            "temperature": 200,
            "perimeter_speed": 40,
            "external_perimeter_speed": 28,
            "top_solid_layers": 8,
            "bottom_solid_layers": 6,
            "first_layer_temperature": 230,
            "support_material_spacing": 0.7,
            "support_material_contact_distance": 0.15
        },
        med: {
            "layer_height": 0.15,
            "travel_speed": 150,
            "infill_speed": 80,
            "support_material_speed": 80,
            "retract_lift" : 0.05,
            "temperature": 200,
            "perimeter_speed": 40,
            "external_perimeter_speed": 28,
            "top_solid_layers": 5,
            "bottom_solid_layers": 5,
            "first_layer_temperature": 230,
            "support_material_spacing": 0.7,
            "support_material_contact_distance": 0.15
        },
        low: {
            "layer_height": 0.3,
            "travel_speed": 150,
            "infill_speed": 65,
            "support_material_speed": 65,
            "retract_lift" : 0.05,
            "temperature": 215,
            "perimeter_speed": 40,
            "external_perimeter_speed": 28,
            "top_solid_layers": 3,
            "bottom_solid_layers": 3,
            "first_layer_temperature": 230,
            "support_material_spacing": 0.7,
            "support_material_contact_distance": 0.15
        }
    },
    fd1: {
        high: {
            "layer_height": 0.075,
            "travel_speed": 80,
            "infill_speed": 60,
            "support_material_speed": 60,
            "retract_lift" : 0.24,
            "temperature": 200,
            "perimeter_speed": 40,
            "external_perimeter_speed": 28,
            "top_solid_layers": 8,
            "bottom_solid_layers": 6,
            "first_layer_temperature": 230,
            "support_material_spacing": 1.7,
            "support_material_contact_distance": 0.3
        },
        med: {
            "layer_height": 0.15,
            "travel_speed": 100,
            "infill_speed": 60,
            "support_material_speed": 60,
            "retract_lift" : 0.24,
            "temperature": 200,
            "perimeter_speed": 40,
            "external_perimeter_speed": 28,
            "top_solid_layers": 5,
            "bottom_solid_layers": 5,
            "first_layer_temperature": 230,
            "support_material_spacing": 1.7,
            "support_material_contact_distance": 0.3
        },
        low: {
            "layer_height": 0.3,
            "travel_speed": 120,
            "infill_speed": 50,
            "support_material_speed": 50,
            "retract_lift" : 0.24,
            "temperature": 215,
            "perimeter_speed": 40,
            "external_perimeter_speed": 28,
            "top_solid_layers": 3,
            "bottom_solid_layers": 3,
            "first_layer_temperature": 230,
            "support_material_spacing": 1.7,
            "support_material_contact_distance": 0.3
        }
    }
  }
});
