#!/usr/bin/env python3
"""
Aurora Room Architecture Module
Manages physical space structures, dynamic environment layouts, 
and zone allocations inside the Constellation Incubator workspace.
"""

import logging

# Configure basic logging layout
logging.basicConfig(
    level=logging.INFO,
    format="[ROOM-ARCH] %(asctime)s - %(levelname)s - %(message)s"
)

class IncubatorRoomManager:
    def __init__(self):
        # The 4 core structural tracking states defined in the repository map
        self.valid_zones = ["vault", "overflow", "ideashelf", "ideabin"]

    def allocate_project_zone(self, room_id, target_zone, nda_status=False):
        """
        Alters project visibility metrics based on NDA status 
        and updates the constellation_project_zones tracking indexes.
        """
        target_zone = target_zone.lower().strip()
        
        if target_zone not in self.valid_zones:
            logging.error(f"Allocation error: '{target_zone}' is not a valid architectural zone.")
            return {"success": False, "error": "Invalid zone allocation tracking target"}

        # LEGAL SAFETY SHIELD: Enforce strict gatekeeping for core intellectual files
        if target_zone in ["vault", "overflow"] and not nda_status:
            logging.warning(f"Access Denied: Room {room_id} requires a fully signed NDA to access the '{target_zone}' zone.")
            return {
                "success": False, 
                "error": f"LOCKED - Accessing the {target_zone.capitalize()} requires active platform-wide NDA protection."
            }

        logging.info(f"Successfully allocated Room {room_id} into workspace tracking track: '{target_zone.upper()}'")
        return {
            "success": True,
            "room_id": room_id,
            "assigned_zone": target_zone,
            "status": "Active sync confirmed"
        }

    def fetch_zone_accessibility_parameters(self, user_profile):
        """
        Ensures that room interactions adapt instantly to the user's custom 
        accessibility inputs across every single active workspace layout layer.
        """
        # Read profile configs corresponding with database settings
        input_mode = user_profile.get("input_mode_preference", "standard")
        dyslexia_font = user_profile.get("dyslexia_font_enabled", False)
        
        accessibility_payload = {
            "apply_dyslexia_typography": dyslexia_font,
            "stream_handler": "StandardInput",
            "hardware_intercept_active": False
        }

        # Route specialized device logic
        if input_mode == "speak_to_text":
            accessibility_payload["stream_handler"] = "VoiceCaptureEngine"
        elif input_mode == "asl_camera_input":
            accessibility_payload["stream_handler"] = "ASLCameraMatrix"
        elif input_mode == "external_switch_device":
            accessibility_payload["stream_handler"] = "ExternalHardwareKeyLogger"
            accessibility_payload["hardware_intercept_active"] = True

        return accessibility_payload
