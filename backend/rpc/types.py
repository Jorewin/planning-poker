from typing import NotRequired, TypedDict


class PlayerSelectionDTO(TypedDict):
    username: str
    selection: NotRequired[int | None]

class SessionDTO(TypedDict):
    id: int
    user_is_owner: bool
