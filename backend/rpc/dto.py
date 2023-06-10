from dataclasses import dataclass


@dataclass
class PlayerSelectionDTO:
    player_id: int
    selection: int | None = None
