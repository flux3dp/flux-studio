define([
    'jquery',
    'app/default-print-settings',
], (
    $,
    DefaultPrintConfigs
) => {

    const CONFIG_FLUX_TO_CURA = {
        first_layer_height                  : { key: 'layer_height_0' },
        perimeters                          : { key: 'wall_line_count' },
        top_solid_layers                    : { key: 'top_layers' },
        bottom_solid_layers                 : { key: 'bottom_layers' },
        fill_density                        : { key: 'infill_line_distance', fn: (v, settings) => { v = v || '10%'; return  v === '0%' ? 0 : (0.4 * 100 / parseFloat(v.toString().replace('%', ''))); } },
        fill_pattern                        : { key: 'infill_pattern', fn: (v) => {
                                                                            v = v.toLowerCase();
                                                                            return (['automatic','grid','lines','concentric','concentric_3d','cubic','cubicsubdiv','tetrahedral','triangles','zigzag',].indexOf(v) >= 0 ? v : 'zigzag').toLowerCase();
                                                                       } },
        support_material                    : { key: 'support_enable', fn: (v) => { return !!parseInt(v); } },
        support_material_spacing            : { key: 'support_line_distance' },
        support_material_threshold          : { key: 'support_angle', fn: (v) => { return 90.0 - parseFloat(v); } },
        support_material_pattern            : { key: 'support_pattern', fn: (v) => {
                                                                            v = v.toLowerCase();
                                                                            return (['zigzag', 'grid', 'lines'].indexOf(v) >= 0 ? v : 'zigzag').toLowerCase();
                                                                       } },
        support_material_contact_distance   : { key: 'support_top_distance' },
        brim_width                          : { key: 'brim_line_count' },
        skirts                              : { key: 'skirt_line_count' },
        // raft                                : 1,
        raft_layers                         : { key: 'raft_surface_layers' },
        travel_speed                        : { key: 'speed_travel' },
        support_material_speed              : { key: ['speed_support_infill', 'speed_support_interface'], fn: (v) => { return [parseFloat(v), Math.round(parseFloat(v) * 100 / 1.5) / 100]; } },
        infill_speed                        : { key: 'speed_infill' },
        first_layer_speed                   : { key: 'speed_print_layer_0' },
        solid_infill_speed                  : { key: 'speed_topbottom' },
        perimeter_speed                     : { key: 'speed_wall_x' },
        external_perimeter_speed            : { key: 'speed_wall_0' },
        start_gcode                         : { key: 'machine_start_gcode' },
        first_layer_temperature             : { key: 'material_print_temperature_layer_0' },
        retract_lift                        : { key: 'retraction_hop' },
        temperature                         : { key: ['temperature', 'material_print_temperature'], fn: (v) => { return [parseFloat(v), parseFloat(v)]; }},
        layer_height                        : { key: ['layer_height', 'infill_sparse_thickness'], fn: (v) => { return [parseFloat(v), parseFloat(v)]; }},
        cut_bottom                          : { key: 'cut_bottom' },
        z_offset                            : { key: 'z_offset' },
        xy_offset                           : { key: 'xy_offset' },
    },
    CONFIG_CURA_TO_FLUX = {},
    CURA2_CONFIG_KEYS = ['raft', 'temperature', 'detect_filament_runout', 'flux_calibration', 'detect_head_tilt', 'cut_bottom', 'pause_at_layers', 'z_offset', 'machine_name','machine_show_variants','machine_start_gcode','machine_end_gcode','material_guid','material_bed_temp_wait','material_print_temp_wait','material_print_temp_prepend','material_bed_temp_prepend','machine_width','machine_depth','machine_shape','machine_height','machine_heated_bed','machine_center_is_zero','machine_extruder_count','machine_nozzle_tip_outer_diameter','machine_nozzle_head_distance','machine_nozzle_expansion_angle','machine_heat_zone_length','machine_filament_park_distance','machine_nozzle_heat_up_speed','machine_nozzle_cool_down_speed','machine_min_cool_heat_time_window','machine_gcode_flavor','machine_disallowed_areas','nozzle_disallowed_areas','machine_head_polygon','machine_head_with_fans_polygon','gantry_height','machine_nozzle_size','machine_use_extruder_offset_to_offset_coords','extruder_prime_pos_z','extruder_prime_pos_abs','machine_max_feedrate_x','machine_max_feedrate_y','machine_max_feedrate_z','machine_max_feedrate_e','machine_max_acceleration_x','machine_max_acceleration_y','machine_max_acceleration_z','machine_max_acceleration_e','machine_acceleration','machine_max_jerk_xy','machine_max_jerk_z','machine_max_jerk_e','machine_minimum_feedrate','layer_height','layer_height_0','wall_line_width_0','wall_line_width_x','skin_line_width','infill_line_width','skirt_brim_line_width','support_line_width','support_interface_line_width','prime_tower_line_width','wall_line_count','wall_0_wipe_dist','top_layers','bottom_layers','top_bottom_pattern','top_bottom_pattern_0','wall_0_inset','outer_inset_first','alternate_extra_perimeter','travel_compensate_overlapping_walls_0_enabled','travel_compensate_overlapping_walls_x_enabled','fill_perimeter_gaps','xy_offset','z_seam_type','z_seam_x','z_seam_y','skin_no_small_gaps_heuristic','infill_line_distance','infill_pattern','sub_div_rad_mult','sub_div_rad_add','infill_overlap_mm','skin_overlap_mm','infill_wipe_dist','infill_sparse_thickness','gradual_infill_steps','gradual_infill_step_height','infill_before_walls','min_infill_area','material_flow_dependent_temperature','default_material_print_temperature','material_print_temperature','material_print_temperature_layer_0','material_initial_print_temperature','material_final_print_temperature','material_flow_temp_graph','material_extrusion_cool_down_speed','material_bed_temperature','material_bed_temperature_layer_0','material_diameter','material_flow','retraction_enable','retract_at_layer_change','retraction_amount','retraction_retract_speed','retraction_prime_speed','retraction_extra_prime_amount','retraction_min_travel','retraction_count_max','retraction_extrusion_window','material_standby_temperature','switch_extruder_retraction_amount','switch_extruder_retraction_speed','switch_extruder_prime_speed','speed_infill','speed_wall_0','speed_wall_x','speed_topbottom','speed_support_infill','speed_support_interface','speed_prime_tower','speed_travel','speed_print_layer_0','speed_travel_layer_0','skirt_brim_speed','max_feedrate_z_override','speed_slowdown_layers','speed_equalize_flow_enabled','speed_equalize_flow_max','acceleration_enabled','acceleration_infill','acceleration_wall_0','acceleration_wall_x','acceleration_topbottom','acceleration_support_infill','acceleration_support_interface','acceleration_prime_tower','acceleration_travel','acceleration_print_layer_0','acceleration_travel_layer_0','acceleration_skirt_brim','jerk_enabled','jerk_infill','jerk_wall_0','jerk_wall_x','jerk_topbottom','jerk_support_infill','jerk_support_interface','jerk_prime_tower','jerk_travel','jerk_print_layer_0','jerk_travel_layer_0','jerk_skirt_brim','retraction_combing','travel_avoid_other_parts','travel_avoid_distance','start_layers_at_same_position','layer_start_x','layer_start_y','retraction_hop_enabled','retraction_hop_only_when_collides','retraction_hop','retraction_hop_after_extruder_switch','cool_fan_enabled','cool_fan_speed_min','cool_fan_speed_max','cool_min_layer_time_fan_speed_max','cool_fan_speed_0','cool_fan_full_layer','cool_min_layer_time','cool_min_speed','cool_lift_head','support_enable','support_infill_extruder_nr','support_extruder_nr_layer_0','support_interface_extruder_nr','support_type','support_angle','support_pattern','support_connect_zigzags','support_line_distance','support_top_distance','support_bottom_distance','support_xy_distance','support_xy_overrides_z','support_xy_distance_overhang','support_bottom_stair_step_height','support_join_distance','support_offset','support_interface_enable','support_roof_height','support_bottom_height','support_interface_skip_height','support_interface_line_distance','support_interface_pattern','support_use_towers','support_tower_diameter','support_minimal_diameter','support_tower_roof_angle','extruder_prime_pos_x','extruder_prime_pos_y','adhesion_type','adhesion_extruder_nr','skirt_line_count','skirt_gap','skirt_brim_minimal_length','brim_line_count','brim_outside_only','raft_margin','raft_airgap','layer_0_z_overlap','raft_surface_layers','raft_surface_thickness','raft_surface_line_width','raft_surface_line_spacing','raft_interface_thickness','raft_interface_line_width','raft_interface_line_spacing','raft_base_thickness','raft_base_line_width','raft_base_line_spacing','raft_surface_speed','raft_interface_speed','raft_base_speed','raft_surface_acceleration','raft_interface_acceleration','raft_base_acceleration','raft_surface_jerk','raft_interface_jerk','raft_base_jerk','raft_surface_fan_speed','raft_interface_fan_speed','raft_base_fan_speed','prime_tower_enable','prime_tower_size','prime_tower_wall_thickness','prime_tower_position_x','prime_tower_position_y','prime_tower_flow','prime_tower_wipe_enabled','dual_pre_wipe','ooze_shield_enabled','ooze_shield_angle','ooze_shield_dist','meshfix_union_all','meshfix_union_all_remove_holes','meshfix_extensive_stitching','meshfix_keep_open_polygons','multiple_mesh_overlap','carve_multiple_volumes','alternate_carve_order','print_sequence','infill_mesh','infill_mesh_order','support_mesh','anti_overhang_mesh','magic_mesh_surface_mode','magic_spiralize','draft_shield_enabled','draft_shield_dist','draft_shield_height_limitation','draft_shield_height','conical_overhang_enabled','conical_overhang_angle','coasting_enable','coasting_volume','coasting_min_volume','coasting_speed','skin_outline_count','skin_alternate_rotation','support_conical_enabled','support_conical_angle','support_conical_min_width','infill_hollow','magic_fuzzy_skin_enabled','magic_fuzzy_skin_thickness','magic_fuzzy_skin_point_dist','wireframe_enabled','wireframe_height','wireframe_roof_inset','wireframe_printspeed_bottom','wireframe_printspeed_up','wireframe_printspeed_down','wireframe_printspeed_flat','wireframe_flow_connection','wireframe_flow_flat','wireframe_top_delay','wireframe_bottom_delay','wireframe_flat_delay','wireframe_up_half_speed','wireframe_top_jump','wireframe_fall_down','wireframe_drag_along','wireframe_strategy','wireframe_straight_before_down','wireframe_roof_fall_down','wireframe_roof_drag_along','wireframe_roof_outer_delay','wireframe_nozzle_clearance','center_object','mesh_position_x','mesh_position_y','mesh_position_z','mesh_rotation_matrix'];

    let logError = () => { console.error('Cura Rev Function not implemented', i); };
    for(let i in CONFIG_FLUX_TO_CURA) {
        let item = CONFIG_FLUX_TO_CURA[i];
        CONFIG_CURA_TO_FLUX[item.key] = {key: i};
        if (item.fn) {
            CONFIG_CURA_TO_FLUX[item.key].fn = logError;
        }
    }

    CONFIG_CURA_TO_FLUX.support_angle.fn = (v) => { return 90 - v; };
    CONFIG_CURA_TO_FLUX.support_enable.fn = (v) => { return (v === true || v === 1 || v === 'true') ? 1 : 0; };
    CONFIG_CURA_TO_FLUX.speed_support_infill = { key: 'support_material_speed' };
    CONFIG_CURA_TO_FLUX.infill_line_distance = { key: 'fill_density', fn: (v, settings) => { return Math.min(100, 40/parseFloat(v)); } };

    CONFIG_CURA_TO_FLUX.support_pattern.fn = (v) => { return v.toUpperCase(); };
    CONFIG_CURA_TO_FLUX.infill_pattern.fn =(v) => { return v.toUpperCase(); };

    function insertConfig(lines, key, value) {
        let keyValue = key + ' = ' + value,
            lineNumber = -1;

        for(var j = 0; j < lines.length && lineNumber < 0; j++) {
            if (lines[j].indexOf(key + ' ') === 0) { lineNumber = j; }
            if (lines[j].indexOf(key + '=') === 0) { lineNumber = j; }
        }

        if(lineNumber >= 0) {
            lines[lineNumber] = keyValue;
        } else if(notSys(key)) {
            lines.push(keyValue);
        }
    }

    function SlicerConfig(id, opts) {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        }
        this.id = id || ( s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4());
        // Default Config
        this.config = {
            engine                              : 'cura2',
            temperature                         : 200,
            first_layer_temperature             : 230,
            detect_filament_runout              : 1,
            flux_calibration                    : 1,
            detect_head_tilt                    : 1,
            // Layers
            layer_height                        : 0.15,
            first_layer_height                  : 0.25,
            perimeters                          : 3,
            top_solid_layers                    : 4,
            bottom_solid_layers                 : 4,
            // Infill
            fill_density                        : 10,
            fill_pattern                        : 'LINES',
            spiral_vase                         : 0,
            // Support
            support_material                    : 0,
            support_material_spacing            : 2.7,
            support_material_threshold          : 37,
            support_material_pattern            : 'LINES',
            support_material_contact_distance   : 0.06,
            brim_width                          : 0,
            skirts                              : 0,
            raft                                : 0,
            raft_layers                         : 4,
            // Speed
            travel_speed                        : 80,
            support_material_speed              : 40,
            infill_speed                        : 60,
            first_layer_speed                   : 20,
            solid_infill_speed                  : 30,
            perimeter_speed                     : 40,
            external_perimeter_speed            : 28,
            bridge_speed                        : 60
        }

        // Default ConfigStr
        this.configStr                         = DefaultPrintConfigs.cura2;

        if (opts) {
            for (var i in opts) {
                this.config[i] = opts[i];
            }
        }
    }

    SlicerConfig.prototype.getConfigStr = function(customString = '') {
        let self = this;

        var newConfigsStr = ( customString || self.configStr ).split('\n');
        Object.keys(self.config).map((key) => {
            let value = self.config[key];
            if (CONFIG_FLUX_TO_CURA[key] && CONFIG_FLUX_TO_CURA[key].key) {
                let item = CONFIG_FLUX_TO_CURA[key];

                if (item.key instanceof Array) {
                    item.key.map((v, i) => {
                        value = item.fn ? item.fn(value, self)[i] : value;
                        insertConfig(newConfigsStr, v, value);
                    });
                    return;
                } else {
                    key = item.key;
                    value = item.fn ? item.fn(value, self) : value;
                }
            }

            // support_material is for slic3r and cura, we manually reject
            if (
                CURA2_CONFIG_KEYS.indexOf(key) >= 0
            ) {
                insertConfig(newConfigsStr, key, value);
            }
        });
        return newConfigsStr.join('\n');
    };

    SlicerConfig.prototype.setConfigStr = function (v) {
        if (v == null) {
            throw new Error("Setting Null Config");
        }
        this.configStr = v;
    }
    SlicerConfig.prototype.fixConfigStr = function () {
        this.setConfigStr(this.getConfigStr(''));
    }
    SlicerConfig.prototype.load = function (settings, withCustom = false) {
        if (typeof settings === 'object') {
            if (settings.defaultSetting) {
                this.configStr = settings.configStr;
                this.setConfigStr(settings.str);
                this.load(this.configStr);
                this.setConfigStr(this.getConfigStr(''));
                if(this.configStr === null) { throw new Error('null configStr error'); }
            }
            else {
                let holdAttrs = { id: settings.id };
                if (!withCustom) {
                    holdAttrs = {
                        id: settings.id,
                        customCura2: settings.str
                    };
                    delete settings.str;
                }
                delete settings.id;
                Object.assign(this, settings);
                Object.assign(settings, holdAttrs);
                this.fixConfigsCompatibility();
                this.configStr = this.getConfigStr('');
            }
            console.log('Load settings object', this.id);
        }
        else {
            var settings = settings.split('\n');

            settings.forEach(function(line) {
                var item = line.split('=');

                if(item.length === 2) {
                    let _key = item[0].replace(/ /g, ''),
                        _value = item[1].trim();

                    let configValueTranslator = CONFIG_CURA_TO_FLUX[_key];
                    if (_key === 'support_angle') {
                        console.log(configValueTranslator);
                    }
                    // dirty code for now, need refactor
                    if(_key === 'support_enable') {
                        this.config[_key] = parseFloat(_value) || _value;
                    }
                    if (configValueTranslator) {
                        this.config[configValueTranslator.key] = configValueTranslator.fn ? configValueTranslator.fn(_value, self) : _value;
                    } else if (this.hasOwnProperty(_key)) {
                        this.config[_key] = parseFloat(_value) || _value;
                    }
                }
            }.bind(this));

            this.configStr = settings.join('\n');
            if(this.configStr == null) { throw new Error('null configStr error'); }
        }

        if(this.configStr == null) { throw new Error('null configStr error'); }
    };

    SlicerConfig.prototype.set = function (id, value) {
        // TODO map keys
        if (id == 'flexible_material') {
            if (value) {
                this.start_gcode = "G1 F5000 Z50\\nG92 Z49.9\\nG92 E0";
            } else {
                this.start_gcode = "G1 F6000 Z50\\nG92 Z49.9\\nG1 F2400 E32\\nG92 E0";
            }
            update = true;
        }
        console.log("setting config", id, value, this.config);
        this.config[id] = value;
    };

    SlicerConfig.prototype.filter = function(p0) {
        let self = this;
        var param = { key: p0.key, value: p0.value };
        if (CONFIG_FLUX_TO_CURA[param.key] && CONFIG_FLUX_TO_CURA[param.key].key) {
            let item = CONFIG_FLUX_TO_CURA[param.key];
            if (item.key instanceof Array) {
                param.key = item.key;
                param.value = [];
                item.key.map((v, i) => {
                    param.value[i] = item.fn ? item.fn(p0.value, self)[i] : p0.value;
                });
            } else {
                param.key = item.key;
                param.value = item.fn ? item.fn(param.value, self) : param.value;
            }
        }
        return param;
    };

    SlicerConfig.prototype.update = function (opts) {
        for(var key in opts) {
            if (!opts.hasOwnProperty(key)) { return; }
            this.set(key, opts[key]);
        }
        this.setConfigStr(this.getConfigStr(this.configStr));
        if(this.configStr == null) { throw new Error('null configStr error'); }
    };

    SlicerConfig.prototype.fixConfigsCompatibility = function() {
    };

    SlicerConfig.prototype.toString = function() {
        return JSON.stringify(this);
    };

    SlicerConfig.prototype.deepClone = function() {
        let clone = new SlicerConfig(this.id + '-clone');
        Object.assign(clone, this);
        return clone;
    };

    return SlicerConfig;
});
